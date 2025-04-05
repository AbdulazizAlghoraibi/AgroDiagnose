"""
Script to start the Flask API
"""
import os
import subprocess
import sys
import time
import atexit
import signal

# Get the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))

# Flask process reference
flask_process = None

def cleanup():
    """Clean up function to terminate the Flask process on exit"""
    global flask_process
    if flask_process:
        print("Terminating Flask process...")
        try:
            # Try to terminate gracefully first
            flask_process.terminate()
            flask_process.wait(timeout=5)
        except:
            # If it doesn't work, force kill
            flask_process.kill()

def signal_handler(sig, frame):
    """Handle Ctrl+C and other signals"""
    print("\nReceived shutdown signal. Cleaning up...")
    cleanup()
    sys.exit(0)

def run_flask_app():
    """Run the Flask application on the specified port"""
    global flask_process
    
    # Register cleanup handlers
    atexit.register(cleanup)
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Get port from environment variable or use default
    port = os.environ.get("FLASK_PORT", "5001")
    
    try:
        # Change to the directory where app.py is located
        os.chdir(current_dir)
        
        # Start the Flask app as a subprocess
        print(f"Starting Flask API on port {port}...")
        
        # Set environment variables for the subprocess
        env = os.environ.copy()
        env["PORT"] = port
        
        # Launch Flask app
        flask_process = subprocess.Popen(
            [sys.executable, "app.py"],
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True
        )
        
        # Give Flask time to start up
        time.sleep(2)
        
        # Check if Flask started successfully
        if flask_process.poll() is not None:
            # Process exited already, get any error output
            output, _ = flask_process.communicate()
            print(f"Flask failed to start: {output}")
            return False
        
        print(f"Flask API is running on http://localhost:{port}/")
        
        # Monitor Flask's stdout/stderr in real-time
        while True:
            output = flask_process.stdout.readline()
            if output:
                print(output.strip())
            
            # Check if process is still running
            if flask_process.poll() is not None:
                # Process exited
                remaining_output, _ = flask_process.communicate()
                if remaining_output:
                    print(remaining_output.strip())
                print("Flask process terminated.")
                break
            
            # Small sleep to prevent high CPU usage
            time.sleep(0.1)
            
        return True
        
    except Exception as e:
        print(f"Error starting Flask: {str(e)}")
        return False

if __name__ == "__main__":
    run_flask_app()