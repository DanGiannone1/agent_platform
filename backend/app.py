from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
from cosmos_db import CosmosDBManager
import humps  # This should be installed via pip install pyhumps

app = Flask(__name__)
# Configure CORS with specific options
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "myurl.com"],  # Add your frontend URL here
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

cosmos_db = CosmosDBManager()

def convert_to_camel_case(data):
    """Convert snake_case to camelCase in the response payload"""
    if isinstance(data, dict):
        return humps.camelize(data)
    elif isinstance(data, list):
        return [humps.camelize(item) if isinstance(item, dict) else item for item in data]
    return data

@app.after_request
def after_request(response):
    """Convert all response payloads to camelCase"""
    if response.content_type == 'application/json':
        try:
            data = response.get_json()
            if data is not None:  # Only process if there's JSON data
                camel_case_data = convert_to_camel_case(data)
                response.set_data(jsonify(camel_case_data).get_data())
        except Exception as e:
            print(f"Error in after_request: {str(e)}")
    return response

@app.route('/available_agents', methods=['GET'])
def get_available_agents():
    query = "SELECT c.id, c.name, c.description FROM c WHERE c.type = 'agent'"
    agents = cosmos_db.query_items(query)
    return jsonify(agents)

@app.route('/agent_execution_info', methods=['GET'])
def get_agent_execution_info():
    # Get currently running agents
    running_query = """
    SELECT c.id, c.name, c.status, c.start_time, c.end_time
    FROM c
    WHERE c.type = 'agent_execution'
    AND c.status = 'running'
    """
    running_agents = cosmos_db.query_items(running_query)

    # Get recently completed agents (last 7 days)
    completed_query = """
    SELECT c.id, c.name, c.status, c.start_time, c.end_time
    FROM c
    WHERE c.type = 'agent_execution'
    AND c.status = 'completed'
    AND c.end_time >= @cutoff_date
    """
    cutoff_date = (datetime.utcnow() - timedelta(days=7)).isoformat()
    completed_agents = cosmos_db.query_items(
        completed_query,
        parameters=[{"name": "@cutoff_date", "value": cutoff_date}]
    )

    response_data = {
        'currently_running': running_agents or [],
        'recently_completed': completed_agents or []
    }
    return jsonify(response_data)

@app.route('/start_agent', methods=['POST'])
def start_agent():
    agent_id = request.json.get('id')
    if not agent_id:
        return jsonify({'success': False, 'message': 'Agent ID is required'}), 400

    # Create an execution record
    execution_record = {
        'id': f'exec_{datetime.utcnow().isoformat()}',
        'type': 'agent_execution',
        'agent_id': agent_id,
        'status': 'running',
        'start_time': datetime.utcnow().isoformat(),
        'partition_key': agent_id  # Using agent_id as partition key
    }

    try:
        cosmos_db.create_item(execution_record)
        return jsonify({
            'success': True,
            'message': f'Agent {agent_id} started successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to start agent: {str(e)}'
        }), 500

if __name__ == '__main__':
    app.run(debug=True)