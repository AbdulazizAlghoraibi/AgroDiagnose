import os
import json
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
from io import BytesIO
from PIL import Image
import logging
from translations import translate_class_name

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global variables
class_indices = None
model = None

def load_model():
    """Load the TensorFlow.js model."""
    global model
    try:
        model_dir = os.path.join(os.path.dirname(__file__), 'plant_model')
        model_path = os.path.join(model_dir, 'model.json')
        
        if os.path.exists(model_path):
            logger.info(f"Loading model from {model_path}")
            
            # Import tfjs converter (part of tensorflowjs package)
            import tensorflowjs as tfjs
            
            # Load model from TensorFlow.js format
            model = tfjs.converters.load_keras_model(model_path)
            
            # Compile the model with appropriate loss and optimizer
            model.compile(
                optimizer='adam',
                loss='categorical_crossentropy',
                metrics=['accuracy']
            )
            
            logger.info("Model loaded and compiled successfully")
            return True
        else:
            logger.error(f"Model file not found at {model_path}")
            return False
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        return False

def load_class_indices():
    """Load the class indices from the JSON file."""
    global class_indices
    try:
        # Load class indices
        class_indices_path = os.path.join(os.path.dirname(__file__), 'class_indices.json')
        if os.path.exists(class_indices_path):
            with open(class_indices_path, 'r') as f:
                class_indices = json.load(f)
                logger.info(f"Loaded {len(class_indices)} classes from {class_indices_path}")
                return True
        else:
            logger.error(f"Class indices file not found at {class_indices_path}")
            return False
    except Exception as e:
        logger.error(f"Error loading class indices: {str(e)}")
        return False

def preprocess_image(image):
    """
    Preprocess the image for the TensorFlow model.
    Resize to 224x224 and normalize pixel values.
    """
    try:
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize to the expected input size (224x224)
        image = image.resize((224, 224))
        
        # Convert to numpy array and normalize to [0,1]
        img_array = np.array(image).astype(np.float32) / 255.0
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    except Exception as e:
        logger.error(f"Error preprocessing image: {str(e)}")
        return None

def determine_severity(confidence):
    """Determine severity level based on confidence score."""
    if confidence > 0.85:
        return "high"
    elif confidence > 0.65:
        return "medium"
    else:
        return "low"

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    global model, class_indices
    
    status = {
        "model_loaded": model is not None,
        "class_indices_loaded": class_indices is not None
    }
    
    if model is None:
        success = load_model()
        status["model_loaded"] = success
    
    if class_indices is None:
        success = load_class_indices()
        status["class_indices_loaded"] = success
    
    if status["model_loaded"] and status["class_indices_loaded"]:
        return jsonify({
            "status": "ok", 
            "message": "API is ready", 
            "num_classes": len(class_indices) if class_indices else 0
        }), 200
    else:
        return jsonify({
            "status": "error", 
            "message": "API is not fully initialized",
            "details": status
        }), 503

@app.route('/predict', methods=['POST'])
def predict():
    """Predict plant disease from image using TensorFlow model."""
    global model, class_indices
    
    # Load model and class indices if not already loaded
    if model is None:
        success = load_model()
        if not success:
            return jsonify({
                "status": "error",
                "message": "Failed to load model. Please check server logs."
            }), 500
    
    if class_indices is None:
        success = load_class_indices()
        if not success:
            return jsonify({
                "status": "error",
                "message": "Failed to load class information. Please check server logs."
            }), 500
    
    try:
        # Check if the request contains a file or base64 image
        if 'file' in request.files:
            file = request.files['file']
            img = Image.open(file.stream)
            logger.info("Processing uploaded file")
        elif 'image' in request.form:
            # Handle base64 encoded image
            img_data = request.form['image']
            if img_data.startswith('data:image'):
                # Remove the data URL scheme
                img_data = img_data.split(',')[1]
            img_bytes = base64.b64decode(img_data)
            img = Image.open(BytesIO(img_bytes))
            logger.info("Processing base64 image")
        else:
            return jsonify({
                "status": "error",
                "message": "No image provided. Please upload a file or provide a base64 encoded image."
            }), 400
        
        # Preprocess the image
        preprocessed_img = preprocess_image(img)
        if preprocessed_img is None:
            return jsonify({
                "status": "error",
                "message": "Error preprocessing image"
            }), 500
        
        # Run inference with the model
        logger.info("Running model inference")
        
        # Make prediction using the Keras model
        predictions = model.predict(preprocessed_img)
        
        # Extract prediction probabilities
        probabilities = predictions[0]
        predicted_class_idx = np.argmax(probabilities)
        confidence = float(probabilities[predicted_class_idx])
        
        # Get the class name
        class_name = class_indices.get(str(predicted_class_idx), "Unknown")
        
        # Translate class name to Arabic and format English name
        class_en, class_ar = translate_class_name(class_name)
        
        # Determine severity based on confidence
        severity = determine_severity(confidence)
        
        # Return prediction results
        return jsonify({
            "status": "success",
            "prediction": {
                "class_en": class_en,
                "class_ar": class_ar,
                "confidence": confidence,
                "severity": severity
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error making prediction: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Error processing request: {str(e)}"
        }), 500

if __name__ == '__main__':
    # Load model and class indices on startup
    load_model()
    load_class_indices()
    
    # Get the port from environment or use default
    port = int(os.environ.get('FLASK_PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)