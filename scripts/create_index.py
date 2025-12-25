"""Create payload index for language field in Qdrant"""
import os
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import PayloadSchemaType

load_dotenv()

qdrant = QdrantClient(url=os.getenv('QDRANT_URL'), api_key=os.getenv('QDRANT_API_KEY'))
collection_name = os.getenv('QDRANT_COLLECTION', 'robotics-book')

try:
    qdrant.create_payload_index(
        collection_name=collection_name,
        field_name='language',
        field_schema=PayloadSchemaType.KEYWORD,
    )
    print('Created payload index for language field')
except Exception as e:
    print(f'Index creation result: {e}')
