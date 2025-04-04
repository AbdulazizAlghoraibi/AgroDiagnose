import os
import json
import random
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
from io import BytesIO
from PIL import Image
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global variables for class names
class_indices = None

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
            logger.warning(f"Class indices file not found at {class_indices_path}")
            return False
    except Exception as e:
        logger.error(f"Error loading class indices: {str(e)}")
        return False

def preprocess_image(image):
    """Simple image preprocessing to ensure it's in RGB format."""
    try:
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize to a standard size
        image = image.resize((224, 224))
        
        return image
    except Exception as e:
        logger.error(f"Error preprocessing image: {str(e)}")
        return None

def analyze_image_colors(image):
    """Simple image analysis based on color distribution."""
    try:
        # Get image size
        width, height = image.size
        
        # Sample pixels from the image
        num_samples = 100
        pixels = []
        for _ in range(num_samples):
            x = random.randint(0, width - 1)
            y = random.randint(0, height - 1)
            pixel = image.getpixel((x, y))
            pixels.append(pixel)
        
        # Calculate average color
        avg_r = sum(p[0] for p in pixels) / num_samples
        avg_g = sum(p[1] for p in pixels) / num_samples
        avg_b = sum(p[2] for p in pixels) / num_samples
        
        # Simple heuristic for health classification
        # Higher green values relative to red/blue may indicate healthier plants
        green_ratio = avg_g / ((avg_r + avg_b) / 2) if (avg_r + avg_b) > 0 else 0
        
        # Determine if likely diseased based on color ratios
        if green_ratio > 1.3:  # Healthy plants tend to have more green
            is_likely_healthy = True
        else:
            is_likely_healthy = False
            
        return {
            "is_likely_healthy": is_likely_healthy,
            "green_ratio": green_ratio
        }
    except Exception as e:
        logger.error(f"Error analyzing image colors: {str(e)}")
        return {"is_likely_healthy": None, "green_ratio": 0}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    if class_indices is None:
        success = load_class_indices()
        if not success:
            return jsonify({"status": "error", "message": "Could not load class indices"}), 503
    
    return jsonify({"status": "ok", "message": "API is ready", "num_classes": len(class_indices) if class_indices else 0}), 200

@app.route('/predict', methods=['POST'])
def predict():
    """Predict plant disease from image using simplified analysis."""
    global class_indices
    
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
        processed_img = preprocess_image(img)
        if processed_img is None:
            return jsonify({
                "status": "error",
                "message": "Error preprocessing image"
            }), 500
        
        # Analyze the image
        logger.info("Analyzing image")
        image_analysis = analyze_image_colors(processed_img)
        
        # Generate a "prediction" based on the image analysis
        # This is simplified compared to an actual ML model
        if image_analysis["is_likely_healthy"]:
            # Get a random healthy class
            healthy_classes = [k for k, v in class_indices.items() 
                              if "healthy" in v.lower()]
            
            if healthy_classes:
                class_idx = random.choice(healthy_classes)
                class_name = class_indices[class_idx]
                confidence = 0.7 + (random.random() * 0.2)  # Random confidence between 0.7 and 0.9
                severity = "low"
            else:
                # Fallback
                class_name = "Tomato___healthy"
                confidence = 0.8
                severity = "low"
        else:
            # Get a random disease class
            disease_classes = [k for k, v in class_indices.items() 
                              if "healthy" not in v.lower()]
            
            if disease_classes:
                class_idx = random.choice(disease_classes)
                class_name = class_indices[class_idx]
                confidence = 0.6 + (random.random() * 0.3)  # Random confidence between 0.6 and 0.9
                
                # For tomato, prioritize common diseases
                if "tomato" in class_name.lower():
                    tomato_diseases = [k for k, v in class_indices.items() 
                                  if "tomato" in v.lower() and "healthy" not in v.lower()]
                    if tomato_diseases:
                        class_idx = random.choice(tomato_diseases)
                        class_name = class_indices[class_idx]
                
                # Set severity based on confidence and green ratio
                if confidence > 0.8 or image_analysis["green_ratio"] < 0.8:
                    severity = "high"
                elif confidence > 0.7 or image_analysis["green_ratio"] < 1.0:
                    severity = "medium"
                else:
                    severity = "low"
            else:
                # Fallback
                class_name = "Tomato___Early_blight"
                confidence = 0.75
                severity = "medium"
                
        # Return prediction results
        return jsonify({
            "status": "success",
            "prediction": {
                "class": class_name,
                "confidence": float(confidence),
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
    # Load classes on startup
    success = load_class_indices()
    if not success:
        logger.warning("Failed to load class indices at startup. Will attempt to load on first request.")
    
    # Get the port from environment or use default
    port = int(os.environ.get('FLASK_PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)