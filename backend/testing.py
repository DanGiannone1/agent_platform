from cosmos_db import CosmosDBManager
from datetime import datetime, timedelta
import json

def populate_test_data():
    cosmos_db = CosmosDBManager()
    
    print("Starting to populate test data...")
    
    # Create some test agents
    agents = [
        {
            'id': 'agent1',
            'name': 'Data Processing Agent',
            'type': 'agent',
            'description': 'Processes data files and generates reports',
            'partition_key': 'agent1'
        },
        {
            'id': 'agent2',
            'name': 'Image Analysis Agent',
            'type': 'agent',
            'description': 'Analyzes images using computer vision',
            'partition_key': 'agent2'
        },
        {
            'id': 'agent3',
            'name': 'Text Classification Agent',
            'type': 'agent',
            'description': 'Classifies text using ML models',
            'partition_key': 'agent3'
        }
    ]
    
    # Insert agents
    for agent in agents:
        try:
            result = cosmos_db.create_item(agent)
            print(f"Successfully created agent: {json.dumps(result, indent=2)}")
        except Exception as e:
            print(f"Error creating agent {agent['name']}: {str(e)}")

    # Verify agents were created
    query = "SELECT * FROM c WHERE c.type = 'agent'"
    results = cosmos_db.query_items(query)
    print(f"\nVerifying agents in database:")
    for item in results:
        print(f"Found agent: {json.dumps(item, indent=2)}")

if __name__ == "__main__":
    populate_test_data()