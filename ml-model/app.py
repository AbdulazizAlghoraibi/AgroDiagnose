import os
import json
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from io import BytesIO
import logging
import base64
from translations import translate_class_name

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global variables to hold the model and class indices
model = None
class_indices = None

def load_model():
    """Load the TensorFlow model."""
    global model
    
    logger.info("Loading model...")
    
    try:
        # First try loading SavedModel format
        if os.path.exists('plant_model/saved_model.pb'):
            logger.info("Loading SavedModel format...")
            model = tf.saved_model.load('plant_model')
            logger.info("SavedModel loaded successfully")
        else:
            # Fall back to loading Keras model from TensorFlow.js format
            logger.info("SavedModel not found, loading from TF.js format...")
            model = tf.keras.models.load_model('plant_model')
            logger.info("Keras model loaded successfully")
        
        return True
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        return False

def load_class_indices():
    """Load the class indices from the JSON file."""
    global class_indices
    
    try:
        with open('class_indices.json', 'r') as f:
            class_indices = json.load(f)
        logger.info(f"Loaded {len(class_indices)} classes")
        return True
    except Exception as e:
        logger.error(f"Error loading class indices: {str(e)}")
        return False

def preprocess_image(image):
    """Preprocess the image for the model."""
    try:
        # Resize to 224x224 (standard input size for many models)
        image = image.resize((224, 224))
        
        # Convert to array and normalize
        img_array = np.array(image) / 255.0
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    except Exception as e:
        logger.error(f"Error preprocessing image: {str(e)}")
        return None

def determine_severity(confidence):
    """Determine the severity level based on confidence score."""
    if confidence >= 0.75:
        return "high"
    elif confidence >= 0.5:
        return "medium"
    else:
        return "low"

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    if model is None:
        return jsonify({"status": "error", "message": "Model not loaded"}), 503
    
    if class_indices is None:
        return jsonify({"status": "error", "message": "Class indices not loaded"}), 503
    
    return jsonify({"status": "ok", "message": "Model and class indices loaded successfully"}), 200

@app.route('/predict', methods=['POST'])
def predict():
    """Endpoint to make predictions on uploaded images."""
    try:
        # Check if the model and class indices are loaded
        if model is None or class_indices is None:
            success_model = load_model()
            success_indices = load_class_indices()
            
            if not success_model or not success_indices:
                return jsonify({
                    "status": "error",
                    "message": "Failed to load model or class indices"
                }), 500
        
        # Get image from request
        if 'file' in request.files:
            file = request.files['file']
            img = Image.open(file.stream).convert('RGB')
        elif 'image' in request.form:
            # Handle base64 encoded image
            encoded_img = request.form['image']
            img_data = base64.b64decode(encoded_img)
            img = Image.open(BytesIO(img_data)).convert('RGB')
        else:
            return jsonify({
                "status": "error",
                "message": "No image file or base64 image provided"
            }), 400
        
        # Preprocess the image
        processed_img = preprocess_image(img)
        if processed_img is None:
            return jsonify({
                "status": "error",
                "message": "Failed to preprocess image"
            }), 500
        
        # Make prediction
        logger.info("Making prediction...")
        
        # Handle different model formats
        if hasattr(model, 'predict'):
            # For Keras models
            predictions = model.predict(processed_img)
        else:
            # For SavedModel format
            infer = model.signatures["serving_default"]
            predictions = infer(tf.constant(processed_img))
            predictions = list(predictions.values())[0].numpy()
        
        # Get the predicted class index
        predicted_index = np.argmax(predictions, axis=1)[0]
        confidence = float(np.max(predictions))
        
        # Get the class name
        class_name = class_indices.get(str(predicted_index), "Unknown")
        
        # Translate class name
        english_name, arabic_name = translate_class_name(class_name)
        
        # Determine severity
        severity = determine_severity(confidence)
        
        # Return prediction result
        result = {
            "status": "success",
            "prediction": {
                "class_en": english_name,
                "class_ar": arabic_name,
                "confidence": round(confidence, 2),
                "severity": severity
            }
        }
        
        logger.info(f"Prediction: {result}")
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error making prediction: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Error processing image: {str(e)}"
        }), 500

# Load the model and class indices when the app starts
if __name__ == '__main__':
    # Try to load model and class indices
    load_model()
    load_class_indices()
    
    # Run the app
    port = int(os.environ.get("PORT", 5001))
    app.run(host='0.0.0.0', port=port)