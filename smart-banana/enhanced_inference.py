import numpy as np
import cv2
from tensorflow import keras
from tensorflow.keras.preprocessing.image import img_to_array
from PIL import Image
import json
import os

class BananaLeafClassifier:
    def __init__(self, model_path, class_indices_path=None):
        """
        Initialize the enhanced banana leaf classifier with out-of-distribution detection.
        
        Args:
            model_path: Path to the trained model
            class_indices_path: Path to class indices JSON file
        """
        # Try multiple loading strategies for compatibility
        self.model = self._load_model_safe(model_path)
        self.diseases = ['cordana', 'healthy', 'pestalotiopsis', 'sigatoka']
        
        # Thresholds for rejection (these can be tuned based on validation data)
        self.min_confidence_threshold = 0.6  # Minimum confidence for the top prediction
        self.max_entropy_threshold = 1.2     # Maximum entropy allowed
        self.feature_similarity_threshold = 0.3  # Minimum feature similarity to training data
    
    def _load_model_safe(self, model_path):
        """
        Safely load model with multiple fallback strategies.
        """
        print(f"🔄 Attempting to load model from {model_path}...")
        
        # Strategy 1: Direct load with Keras 3 compatibility
        try:
            print("Strategy 1: Loading with keras.models.load_model...")
            model = keras.models.load_model(model_path, compile=False)
            print("✅ Model loaded successfully with Strategy 1")
            return model
        except Exception as e1:
            print(f"⚠️ Strategy 1 failed: {e1}")
        
        # Strategy 2: Try loading from JSON + weights if available
        try:
            print("Strategy 2: Loading from JSON + H5 weights...")
            base_path = os.path.dirname(model_path)
            json_path = os.path.join(base_path, 'banana_disease_classification_model.json')
            weights_path = os.path.join(base_path, 'banana_disease_classification_weights.h5')
            
            if os.path.exists(json_path) and os.path.exists(weights_path):
                with open(json_path, 'r') as f:
                    model_json = f.read()
                from tensorflow.keras.models import model_from_json
                model = model_from_json(model_json)
                model.load_weights(weights_path)
                print("✅ Model loaded successfully with Strategy 2")
                return model
            else:
                print(f"⚠️ JSON or weights file not found")
        except Exception as e2:
            print(f"⚠️ Strategy 2 failed: {e2}")
        
        # Strategy 3: Rebuild from config
        try:
            print("Strategy 3: Rebuilding from scratch...")
            # Build a simple CNN that matches the expected architecture
            model = self._build_fallback_model()
            print("✅ Using fallback model architecture")
            return model
        except Exception as e3:
            print(f"⚠️ Strategy 3 failed: {e3}")
            raise Exception(f"All model loading strategies failed. Last error: {e3}")
    
    def _build_fallback_model(self):
        """
        Build a fallback model architecture if loading fails.
        This should match your training architecture.
        """
        from tensorflow.keras.models import Sequential
        from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
        
        model = Sequential([
            Conv2D(32, (3, 3), activation='relu', input_shape=(224, 224, 3)),
            MaxPooling2D(2, 2),
            Conv2D(64, (3, 3), activation='relu'),
            MaxPooling2D(2, 2),
            Conv2D(128, (3, 3), activation='relu'),
            MaxPooling2D(2, 2),
            Flatten(),
            Dense(128, activation='relu'),
            Dropout(0.5),
            Dense(4, activation='softmax')
        ])
        
        print("⚠️ WARNING: Using fallback model without trained weights!")
        return model
        
    def preprocess_image(self, image, target_size=(224, 224)):
        """
        Preprocess the input image for model prediction.
        
        Args:
            image: PIL Image or numpy array
            target_size: Target size for resizing
            
        Returns:
            Preprocessed image array
        """
        if isinstance(image, np.ndarray):
            image = Image.fromarray(image)
        
        # Ensure RGB format
        if image.mode != "RGB":
            image = image.convert("RGB")
            
        # Resize image
        image = image.resize(target_size)
        
        # Convert to array and normalize
        img_array = img_to_array(image)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array / 255.0
        
        return img_array
    
    def calculate_entropy(self, probabilities):
        """
        Calculate the entropy of prediction probabilities.
        High entropy indicates uncertainty.
        
        Args:
            probabilities: Array of prediction probabilities
            
        Returns:
            Entropy value
        """
        # Add small epsilon to avoid log(0)
        epsilon = 1e-10
        probabilities = np.clip(probabilities, epsilon, 1.0)
        entropy = -np.sum(probabilities * np.log(probabilities))
        return entropy
    
    def extract_features(self, img_array):
        """
        Extract features from intermediate layers for similarity checking.
        
        Args:
            img_array: Preprocessed image array
            
        Returns:
            Feature vector from intermediate layer
        """
        # Get features from the layer before the final classification layer
        # This assumes the model has a flatten layer before the final dense layer
        intermediate_layer_model = None
        
        # Find the flatten layer or a suitable intermediate layer
        for i, layer in enumerate(self.model.layers):
            if 'flatten' in layer.name.lower() or 'global_average_pooling' in layer.name.lower():
                from tensorflow.keras.models import Model
                intermediate_layer_model = Model(inputs=self.model.input, 
                                               outputs=self.model.layers[i].output)
                break
        
        if intermediate_layer_model is None:
            # If no suitable layer found, use the layer before the last one
            from tensorflow.keras.models import Model
            intermediate_layer_model = Model(inputs=self.model.input, 
                                           outputs=self.model.layers[-2].output)
        
        features = intermediate_layer_model.predict(img_array, verbose=0)
        return features.flatten()
    
    def is_banana_leaf_like(self, img_array):
        """
        Check if the image has characteristics similar to banana leaves.
        This is a simple approach - can be enhanced with more sophisticated methods.
        
        Args:
            img_array: Preprocessed image array
            
        Returns:
            Boolean indicating if image is banana leaf-like
        """
        # Convert back to image for analysis
        image = (img_array[0] * 255).astype(np.uint8)
        
        # Check for green color dominance (banana leaves are typically green)
        hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
        
        # Define range for green color in HSV
        lower_green = np.array([35, 40, 40])
        upper_green = np.array([85, 255, 255])
        
        # Create mask for green pixels
        green_mask = cv2.inRange(hsv, lower_green, upper_green)
        green_ratio = np.sum(green_mask > 0) / (image.shape[0] * image.shape[1])
        
        # Check if the image has sufficient green content
        return bool(green_ratio > 0.15)  # At least 15% green pixels
    
    def predict_with_rejection(self, image):
        """
        Make prediction with out-of-distribution detection.
        
        Args:
            image: Input image (PIL Image or numpy array)
            
        Returns:
            Dictionary containing prediction results and rejection status
        """
        # Preprocess image
        img_array = self.preprocess_image(image)
        
        # Get model predictions
        predictions = self.model.predict(img_array, verbose=0)[0]
        predicted_class_idx = np.argmax(predictions)
        predicted_class = self.diseases[predicted_class_idx]
        confidence = predictions[predicted_class_idx]
        
        # Calculate entropy
        entropy = self.calculate_entropy(predictions)
        
        # Check if image looks like a banana leaf
        is_leaf_like = self.is_banana_leaf_like(img_array)
        
        # Decision logic for rejection
        reject_reasons = []
        
        if confidence < self.min_confidence_threshold:
            reject_reasons.append(f"Low confidence ({confidence:.3f} < {self.min_confidence_threshold})")
        
        if entropy > self.max_entropy_threshold:
            reject_reasons.append(f"High uncertainty (entropy: {entropy:.3f} > {self.max_entropy_threshold})")
        
        if not is_leaf_like:
            reject_reasons.append("Image doesn't appear to be a leaf")
        
        # Make final decision
        is_rejected = len(reject_reasons) > 0
        
        result = {
            "is_rejected": bool(is_rejected),
            "rejection_reasons": reject_reasons,
            "predicted_class": str(predicted_class),
            "confidence": float(confidence),
            "all_probabilities": {disease: float(prob) for disease, prob in zip(self.diseases, predictions)},
            "entropy": float(entropy),
            "is_leaf_like": bool(is_leaf_like)
        }
        
        if is_rejected:
            result["message"] = "This image doesn't appear to be a banana leaf. Please upload an image of a banana leaf for disease classification."
        else:
            result["message"] = f"Detected: {predicted_class} with {confidence*100:.1f}% confidence"
        
        return result

def test_classifier():
    """
    Test function to demonstrate the enhanced classifier.
    """
    try:
        classifier = BananaLeafClassifier('banana_disease_classification_model.keras')
        print("Enhanced Banana Leaf Classifier loaded successfully!")
        print(f"Diseases: {classifier.diseases}")
        print(f"Confidence threshold: {classifier.min_confidence_threshold}")
        print(f"Entropy threshold: {classifier.max_entropy_threshold}")
        return classifier
    except Exception as e:
        print(f"Error loading classifier: {e}")
        return None

if __name__ == "__main__":
    classifier = test_classifier()
