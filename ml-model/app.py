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
        """Load the TensorFlow SavedModel."""
        global model
        try:
            model_dir = os.path.join(os.path.dirname(__file__), 'saved_model')

            if os.path.exists(model_dir):
                logger.info(f"Loading SavedModel from {model_dir}")
                model = tf.keras.models.load_model(model_dir)
                logger.info("Model loaded successfully")
                return True
            else:
                logger.error(f"SavedModel directory not found at {model_dir}")
                return False
        except Exception as e:
            logger.error(f"Error loading SavedModel: {str(e)}")
            return False

    def load_class_indices():
        """Load the class indices from the JSON file."""
        global class_indices
        try:
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
        """Preprocess the image for the model."""
        try:
            if image.mode != 'RGB':
                image = image.convert('RGB')
            image = image.resize((224, 224))
            img_array = np.array(image).astype(np.float32) / 255.0
            img_array = np.expand_dims(img_array, axis=0)
            return img_array
        except Exception as e:
            logger.error(f"Error preprocessing image: {str(e)}")
            return None

    def determine_severity(confidence):
        if confidence > 0.85:
            return "high"
        elif confidence > 0.65:
            return "medium"
        else:
            return "low"

    @app.route('/health', methods=['GET'])
    def health_check():
        global model, class_indices
        status = {
            "model_loaded": model is not None,
            "class_indices_loaded": class_indices is not None
        }
        if model is None:
            status["model_loaded"] = load_model()
        if class_indices is None:
            status["class_indices_loaded"] = load_class_indices()
        if status["model_loaded"] and status["class_indices_loaded"]:
            return jsonify({"status": "ok", "message": "API is ready", "num_classes": len(class_indices)}), 200
        else:
            return jsonify({"status": "error", "message": "API is not fully initialized", "details": status}), 503

    @app.route('/predict', methods=['POST'])
    def predict():
        global model, class_indices
        if model is None and not load_model():
            return jsonify({"status": "error", "message": "Failed to load model"}), 500
        if class_indices is None and not load_class_indices():
            return jsonify({"status": "error", "message": "Failed to load class indices"}), 500

        try:
            if 'file' in request.files:
                file = request.files['file']
                img = Image.open(file.stream)
            elif 'image' in request.form:
                img_data = request.form['image']
                if img_data.startswith('data:image'):
                    img_data = img_data.split(',')[1]
                img = Image.open(BytesIO(base64.b64decode(img_data)))
            else:
                return jsonify({"status": "error", "message": "No image provided"}), 400

            img_tensor = preprocess_image(img)
            if img_tensor is None:
                return jsonify({"status": "error", "message": "Image preprocessing failed"}), 500

            predictions = model.predict(img_tensor)[0]
            class_idx = int(np.argmax(predictions))
            confidence = float(predictions[class_idx])
            class_name = class_indices.get(str(class_idx), "Unknown")
            class_en, class_ar = translate_class_name(class_name)
            severity = determine_severity(confidence)

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
            logger.error(f"Prediction error: {str(e)}")
            return jsonify({"status": "error", "message": str(e)}), 500

    if __name__ == '__main__':
        load_model()
        load_class_indices()
        port = int(os.environ.get('FLASK_PORT', 5001))
        app.run(host='0.0.0.0', port=port, debug=False)
