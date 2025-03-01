from cosmos_db import CosmosDBManager
from datetime import datetime, timedelta
import json

def populate_test_data():
    cosmos_db = CosmosDBManager()
    
    print("Starting to populate test data...")
    
    # Create some test agents
    agents = [
        {
            'id': '1',
            'name': 'Data Intelligence Agent',
            'type': 'agent',
            'description': 'Answers questions about your data',
            'partitionKey': 'agent_metadata'
        },
        {
            'id': '2',
            'name': 'Document Processing Agent',
            'type': 'agent',
            'description': 'Processes unstructured documents, extracts information, and loads it into structured data stores',
            'partitionKey': 'agent_metadata'
        },
        {
            'id': '3',
            'name': 'Flora Agent',
            'type': 'agent',
            'description': 'Reviews your list of trees/plants/shrubs and provides care instructions and best practices depending on the time of year & your location.',
            'partitionKey': 'agent_metadata'
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