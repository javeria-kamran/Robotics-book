import os
import time
import frontmatter
from pathlib import Path
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
LLM_MODEL = os.getenv("LLM_MODEL", "gemini-2.5-flash")

# Paths
BASE_DIR = Path(__file__).parent.parent
DOCS_DIR = BASE_DIR / "docs"
I18N_DIR = BASE_DIR / "i18n" / "ur" / "docusaurus-plugin-content-docs" / "current"

# Initialize Gemini
client = genai.Client(api_key=GEMINI_API_KEY)

def translate_text(text: str, context: str = "") -> str:
    """Translate text to Urdu using Gemini"""
    prompt = f"""You are a professional technical translator. Translate the following Markdown content from English to Urdu.
    
    Rules:
    1. Maintain all Markdown formatting (headers, lists, code blocks, bold, italic, links).
    2. Keep technical terms in English (e.g., ROS 2, Python, C++, Node, Topic, Service, Action, URDF, Gazebo).
    3. Translate the explanations and descriptive text into natural, professional Urdu.
    4. Do not translate code blocks or inline code.
    5. Do not translate file paths or URLs.
    6. Ensure the output is valid Markdown.
    
    Context: {context}
    
    Content to translate:
    {text}
    """
    
    try:
        response = client.models.generate_content(
            model=LLM_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.3,
            )
        )
        return response.text
    except Exception as e:
        print(f"Error translating: {e}")
        return text

def process_file(file_path: Path):
    """Process a single markdown file"""
    rel_path = file_path.relative_to(DOCS_DIR)
    dest_path = I18N_DIR / rel_path
    
    print(f"Processing: {rel_path}")
    
    # Create destination directory
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Skip if already exists (optional, for now we overwrite or maybe check timestamp)
    # if dest_path.exists():
    #     print(f"Skipping {rel_path} (already exists)")
    #     return

    # Load post
    post = frontmatter.load(file_path)
    
    # Translate frontmatter fields
    if 'title' in post.metadata:
        post.metadata['title'] = translate_text(post.metadata['title'], "Title of a documentation page")
    if 'description' in post.metadata:
        post.metadata['description'] = translate_text(post.metadata['description'], "Description of a documentation page")
        
    # Translate body
    # We might need to chunk if it's too large, but Gemini 1.5/2.0 has large context.
    # Let's try sending the whole body first.
    post.content = translate_text(post.content, f"Documentation page: {rel_path}")
    
    # Save
    with open(dest_path, 'wb') as f:
        frontmatter.dump(post, f)
        
    print(f"Saved to: {dest_path}")
    time.sleep(2) # Rate limiting

def main():
    print("Starting translation...")
    
    # Create base i18n directory
    I18N_DIR.mkdir(parents=True, exist_ok=True)
    
    # Copy _category_.json files directly (maybe translate label later?)
    for category_file in DOCS_DIR.rglob("_category_.json"):
        rel_path = category_file.relative_to(DOCS_DIR)
        dest_path = I18N_DIR / rel_path
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(category_file, 'r', encoding='utf-8') as f:
            data = f.read()
            
        # TODO: Parse JSON and translate 'label' if needed
        # For now, just copy
        with open(dest_path, 'w', encoding='utf-8') as f:
            f.write(data)
            
    # Process markdown files
    for file_path in DOCS_DIR.rglob("*.md"):
        process_file(file_path)
        
    print("Translation complete!")

if __name__ == "__main__":
    main()
