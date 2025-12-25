"""
Test script to verify RAG retrieval is working
"""

import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from qdrant_client import QdrantClient
import numpy as np

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION", "robotics-book")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "gemini-embedding-001")
EMBEDDING_DIMENSIONS = int(os.getenv("EMBEDDING_DIMENSIONS", "768"))


def test_retrieval(query: str):
    print(f"\n🔍 Query: {query}")
    print("-" * 50)
    
    # Initialize clients
    gemini = genai.Client(api_key=GEMINI_API_KEY)
    qdrant = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
    
    # Generate query embedding
    result = gemini.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=query,
        config=types.EmbedContentConfig(
            task_type="RETRIEVAL_QUERY",
            output_dimensionality=EMBEDDING_DIMENSIONS,
        )
    )
    
    vec = np.array(result.embeddings[0].values)
    query_embedding = (vec / np.linalg.norm(vec)).tolist()
    
    # Search Qdrant
    results = qdrant.query_points(
        collection_name=COLLECTION_NAME,
        query=query_embedding,
        limit=3,
    ).points
    
    if not results:
        print("❌ No results found!")
        return
    
    print(f"✓ Found {len(results)} results:\n")
    
    for i, result in enumerate(results, 1):
        print(f"📄 Result {i} (score: {result.score:.4f})")
        print(f"   Title: {result.payload.get('title', 'N/A')}")
        print(f"   File: {result.payload.get('file', 'N/A')}")
        print(f"   Preview: {result.payload.get('text', '')[:200]}...")
        print()


def main():
    print("=" * 50)
    print("RAG Retrieval Test")
    print("=" * 50)
    
    # Test queries
    test_queries = [
        "What is ROS 2?",
        "How do I create a URDF file?",
        "What is the difference between Gazebo and Isaac Sim?",
        "How do VLA models work?",
    ]
    
    for query in test_queries:
        test_retrieval(query)


if __name__ == "__main__":
    main()
