"""
Embedding Pipeline for Physical AI Robotics Book
Chunks markdown files, generates embeddings via Gemini, uploads to Qdrant
"""

import os
import re
import json
from pathlib import Path
from typing import Generator
from dotenv import load_dotenv
import frontmatter
from google import genai
from google.genai import types
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, PayloadSchemaType
import numpy as np

# Load environment variables
load_dotenv()

# Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION", "robotics-book")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "gemini-embedding-001")
EMBEDDING_DIMENSIONS = int(os.getenv("EMBEDDING_DIMENSIONS", "768"))

# Paths
BASE_DIR = Path(__file__).parent.parent
DOCS_PATH = BASE_DIR / "docs"
I18N_PATH = BASE_DIR / "i18n" / "ur" / "docusaurus-plugin-content-docs" / "current"

# Chunk settings
CHUNK_SIZE = 1500  # characters
CHUNK_OVERLAP = 200  # characters


def init_clients():
    """Initialize Gemini and Qdrant clients"""
    # Gemini
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    
    # Qdrant
    qdrant_client = QdrantClient(
        url=QDRANT_URL,
        api_key=QDRANT_API_KEY,
    )
    
    return gemini_client, qdrant_client
print(QDRANT_URL , QDRANT_API_KEY)

def create_collection(qdrant: QdrantClient):
    """Create Qdrant collection if it doesn't exist""" 
    collections = qdrant.get_collections().collections
    collection_names = [c.name for c in collections]
    
    if COLLECTION_NAME not in collection_names:
        qdrant.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=EMBEDDING_DIMENSIONS,
                distance=Distance.COSINE,
            ),
        )
        print(f"✓ Created collection: {COLLECTION_NAME}")
    else:
        print(f"✓ Collection exists: {COLLECTION_NAME}")
    
    # Create payload index for language field (required for filtering)
    try:
        qdrant.create_payload_index(
            collection_name=COLLECTION_NAME,
            field_name="language",
            field_schema=PayloadSchemaType.KEYWORD,
        )
        print("✓ Created payload index for 'language' field")
    except Exception as e:
        # Index might already exist
        print(f"ℹ Payload index status: {e}")


def get_markdown_files(base_path: Path) -> list[Path]:
    """Get all markdown files from a folder"""
    if not base_path.exists():
        return []
    files = list(base_path.rglob("*.md"))
    # Filter out index.md and _category_.json
    files = [f for f in files if f.name != "_category_.json"]
    return sorted(files)


def clean_markdown(text: str) -> str:
    """Remove markdown formatting for cleaner embeddings"""
    # Remove code blocks
    text = re.sub(r'```[\s\S]*?```', '[CODE BLOCK]', text)
    # Remove inline code
    text = re.sub(r'`[^`]+`', '', text)
    # Remove links but keep text
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    # Remove images
    text = re.sub(r'!\[([^\]]*)\]\([^)]+\)', '', text)
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    # Remove headers formatting but keep text
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
    # Remove bold/italic
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    # Remove extra whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> Generator[str, None, None]:
    """Split text into overlapping chunks"""
    if len(text) <= chunk_size:
        yield text
        return
    
    # Split by paragraphs first
    paragraphs = text.split('\n\n')
    current_chunk = ""
    
    for para in paragraphs:
        if len(current_chunk) + len(para) + 2 <= chunk_size:
            current_chunk += para + "\n\n"
        else:
            if current_chunk:
                yield current_chunk.strip()
            # Start new chunk with overlap
            if overlap > 0 and len(current_chunk) > overlap:
                current_chunk = current_chunk[-overlap:] + para + "\n\n"
            else:
                current_chunk = para + "\n\n"
    
    if current_chunk.strip():
        yield current_chunk.strip()


def process_markdown_file(file_path: Path, base_path: Path, language: str) -> list[dict]:
    """Process a markdown file into chunks with metadata"""
    with open(file_path, 'r', encoding='utf-8') as f:
        post = frontmatter.load(f)
    
    content = post.content
    metadata = post.metadata
    
    # Get relative path for reference
    relative_path = file_path.relative_to(base_path)
    
    # Extract title from frontmatter or first heading
    title = metadata.get('title', file_path.stem)
    module = metadata.get('module', 'general')
    description = metadata.get('description', '')
    
    # Clean and chunk the content
    cleaned_content = clean_markdown(content)
    chunks = list(chunk_text(cleaned_content))
    
    documents = []
    for i, chunk in enumerate(chunks):
        doc = {
            'text': chunk,
            'metadata': {
                'file': str(relative_path),
                'title': title,
                'module': module,
                'description': description,
                'chunk_index': i,
                'total_chunks': len(chunks),
                'language': language,
            }
        }
        documents.append(doc)
    
    return documents


def generate_embeddings(gemini: genai.Client, texts: list[str]) -> list[list[float]]:
    """Generate embeddings for a batch of texts using Gemini"""
    result = gemini.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=texts,
        config=types.EmbedContentConfig(
            task_type="RETRIEVAL_DOCUMENT",
            output_dimensionality=EMBEDDING_DIMENSIONS,
        )
    )
    
    embeddings = []
    for embedding in result.embeddings:
        # Normalize the embedding
        vec = np.array(embedding.values)
        normalized = vec / np.linalg.norm(vec)
        embeddings.append(normalized.tolist())
    
    return embeddings


def upload_to_qdrant(qdrant: QdrantClient, documents: list[dict], embeddings: list[list[float]], start_id: int = 0):
    """Upload documents and embeddings to Qdrant"""
    points = []
    for i, (doc, embedding) in enumerate(zip(documents, embeddings)):
        # Use a deterministic ID based on content hash to avoid duplicates/collisions
        # or just use a large offset for Urdu
        
        # Simple ID strategy: start_id + i
        # For Urdu, we can start at 100000 or similar if we want to keep int IDs
        # Or we can use UUIDs. Qdrant supports UUIDs.
        
        point = PointStruct(
            id=start_id + i,
            vector=embedding,
            payload={
                'text': doc['text'],
                **doc['metadata']
            }
        )
        points.append(point)
    
    qdrant.upsert(
        collection_name=COLLECTION_NAME,
        points=points,
    )
    
    return len(points)


def main():
    print("=" * 50)
    print("Physical AI Robotics Book - Embedding Pipeline")
    print("=" * 50)
    
    # Validate environment
    if not GEMINI_API_KEY:
        print("❌ Error: GEMINI_API_KEY not set")
        return
    if not QDRANT_URL:
        print("❌ Error: QDRANT_URL not set")
        return
    if not QDRANT_API_KEY:
        print("❌ Error: QDRANT_API_KEY not set")
        return
    
    print(f"\n📚 Docs path: {DOCS_PATH}")
    print(f"🔗 Qdrant URL: {QDRANT_URL}")
    print(f"📦 Collection: {COLLECTION_NAME}")
    print(f"📐 Dimensions: {EMBEDDING_DIMENSIONS}")
    
    # Initialize clients
    print("\n🔌 Initializing clients...")
    gemini, qdrant = init_clients()
    print("✓ Gemini client ready")
    print("✓ Qdrant client ready")
    
    # Create collection
    print("\n📦 Setting up collection...")
    create_collection(qdrant)
    
    all_documents = []
    
    # Process English files
    print("\n📄 Processing English files...")
    en_files = get_markdown_files(DOCS_PATH)
    print(f"✓ Found {len(en_files)} English files")
    
    for file in en_files:
        docs = process_markdown_file(file, DOCS_PATH, "en")
        all_documents.extend(docs)
        print(f"  📄 {file.name}: {len(docs)} chunks")
        
    # Process Urdu files
    print("\n📄 Processing Urdu files...")
    ur_files = get_markdown_files(I18N_PATH)
    print(f"✓ Found {len(ur_files)} Urdu files")
    
    for file in ur_files:
        docs = process_markdown_file(file, I18N_PATH, "ur")
        all_documents.extend(docs)
        print(f"  📄 {file.name}: {len(docs)} chunks")
    
    print(f"\n📊 Total chunks: {len(all_documents)}")
    
    # Generate embeddings in batches
    print("\n🧠 Generating embeddings...")
    batch_size = 20
    all_embeddings = []
    
    for i in range(0, len(all_documents), batch_size):
        batch = all_documents[i:i + batch_size]
        texts = [doc['text'] for doc in batch]
        try:
            embeddings = generate_embeddings(gemini, texts)
            all_embeddings.extend(embeddings)
            print(f"  ✓ Batch {i // batch_size + 1}/{(len(all_documents) + batch_size - 1) // batch_size}")
        except Exception as e:
            print(f"  ❌ Error in batch {i // batch_size + 1}: {e}")
            # Add dummy embeddings or skip? Better to fail or retry.
            # For now, we'll just skip this batch to avoid crashing everything
            continue
    
    # Upload to Qdrant
    if len(all_embeddings) == len(all_documents):
        print("\n📤 Uploading to Qdrant...")
        uploaded = upload_to_qdrant(qdrant, all_documents, all_embeddings)
        print(f"✓ Uploaded {uploaded} vectors")
    else:
        print(f"\n⚠️ Warning: Mismatch between documents ({len(all_documents)}) and embeddings ({len(all_embeddings)})")
        # Upload what we have? No, indices must match.
        # Only upload matching ones
        min_len = min(len(all_documents), len(all_embeddings))
        uploaded = upload_to_qdrant(qdrant, all_documents[:min_len], all_embeddings[:min_len])
        print(f"✓ Uploaded {uploaded} vectors (partial)")
    
    print("\n" + "=" * 50)
    print("✅ Embedding pipeline complete!")
    print("=" * 50)


if __name__ == "__main__":
    main()
