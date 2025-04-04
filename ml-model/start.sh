#!/bin/bash

# Set environment variables
export PYTHONPATH=$(pwd)
export FLASK_APP=app.py
export FLASK_PORT=5001

# Start the Flask API server
echo "Starting Flask API for ML model on port $FLASK_PORT..."
python3 run.py
