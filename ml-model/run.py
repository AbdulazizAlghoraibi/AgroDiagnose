import os
import sys
import logging
from app import app

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

# Get port from environment or use default
port = int(os.environ.get('FLASK_PORT', 5001))

if __name__ == '__main__':
    # Run the Flask app
    app.run(host='0.0.0.0', port=port, debug=False)