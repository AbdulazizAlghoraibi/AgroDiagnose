"""
Script to start the Flask API
"""
import os
from flask import Flask
import app  # Import the app module with the Flask application

def run_flask_app():
    """Run the Flask application on the specified port"""
    port = int(os.environ.get('FLASK_PORT', 5001))
    app.app.run(host='0.0.0.0', port=port, debug=False)

if __name__ == "__main__":
    run_flask_app()