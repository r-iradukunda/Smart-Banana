import numpy as np
import cv2
import os
from tensorflow import keras
from tensorflow.keras.preprocessing.image import img_to_array
from PIL import Image
import json

class BananaLeafClassifier:
    def __init__(self, model_path, class_indices_path=None):
        """
        Initialize the enhanced banana leaf classifier with out-of-distribution detection.
        
        Args:
            model_path: Path to the trained model
            class_indices_path: Path to class indices JSON file
        """
        # Load model with enhanced error handling
        self.model = self._load_model_safely(model_path)
        self.diseases = ['cordana', 'healthy', 'pestalotiopsis', 'sigatoka']
        
        # Thresholds for rejection (tuned based on validation)
        self.min_confidence_threshold = 0.6
        self.max_entropy_threshold = 1.2
        self.feature_similarity_threshold = 0.3
        
    def _load_model_safely(self, model_path):
        """
        Safely load the model with multiple fallback strategies.
        
        Args:
            model_path: Path to model file
            
        Returns:
            Loaded model
        """
        try:
            # Strategy 1: Direct loading
            return keras.models.load_model(model_path, compile=False)
        except Exception as e1:
            print(f"Standard loading failed: {e1}")
            
            try:
                # Strategy 2: Load with safe_mode=False
                return keras.models.load_model(model_path, compile=False, safe_mode=False)
            except Exception as e2:
                print(f"Safe mode loading failed: {e2}")
                
                try:
                    # Strategy 3: Reconstruct and load weights
                    from tensorflow.keras.applications import MobileNetV2
                    from tensorflow.keras.layers import GlobalAveragePooling2D, Dense
                    from tensorflow.keras import Sequential
                    
                    weights_path = model_path.replace('.keras', '_weights.h5')
                    if not os.path.exists(weights_path):
                        weights_path = os.path.join(
                            os.path.dirname(model_path), 
                            "best_mobilenetv2_weights.h5"
                        )
                    
                    if os.path.exists(weights_path):
                        base_model = MobileNetV2(
                            input_shape=(160, 160, 3),
                            include_top=False,
                            weights=None
                        )
                        
                        model = Sequential([
                            base_model,
                            GlobalAveragePooling2D(),
                            Dense(4, activation='softmax')
                        ])
                        
                        model.load_weights(weights_path)
                        print("✅ Model loaded from weights file")
                        return model
                    else:
                        raise FileNotFoundError(f"Weights file not found: {weights_path}")
                        
                except Exception as e3:
                    print(f"Weights loading failed: {e3}")
                    raise Exception("All model loading strategies failed")
    
    def preprocess_image(self, image, target_size=(160, 160)):
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
        intermediate_layer_model = None
        
        # Find suitable intermediate layer
        for i, layer in enumerate(self.model.layers):
            if 'flatten' in layer.name.lower() or 'global_average_pooling' in layer.name.lower():
                from tensorflow.keras.models import Model
                intermediate_layer_model = Model(
                    inputs=self.model.input, 
                    outputs=self.model.layers[i].output
                )
                break
        
        if intermediate_layer_model is None:
            from tensorflow.keras.models import Model
            intermediate_layer_model = Model(
                inputs=self.model.input, 
                outputs=self.model.layers[-2].output
            )
        
        features = intermediate_layer_model.predict(img_array, verbose=0)
        return features.flatten()
    
    def is_banana_leaf_like(self, img_array):
        """
        Check if the image has characteristics similar to banana leaves.
        
        Args:
            img_array: Preprocessed image array
            
        Returns:
            Boolean indicating if image is banana leaf-like
        """
        # Convert back to image for analysis
        image = (img_array[0] * 255).astype(np.uint8)
        
        # Check for green color dominance
        hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
        
        # Define range for green color in HSV
        lower_green = np.array([35, 40, 40])
        upper_green = np.array([85, 255, 255])
        
        # Create mask for green pixels
        green_mask = cv2.inRange(hsv, lower_green, upper_green)
        green_ratio = np.sum(green_mask > 0) / (image.shape[0] * image.shape[1])
        
        # At least 15% green pixels
        return bool(green_ratio > 0.15)
    
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
            reject_reasons.append(
                f"Low confidence ({confidence:.3f} < {self.min_confidence_threshold})"
            )
        
        if entropy > self.max_entropy_threshold:
            reject_reasons.append(
                f"High uncertainty (entropy: {entropy:.3f} > {self.max_entropy_threshold})"
            )
        
        if not is_leaf_like:
            reject_reasons.append("Image doesn't appear to be a leaf")
        
        # Make final decision
        is_rejected = len(reject_reasons) > 0
        
        result = {
            "is_rejected": bool(is_rejected),
            "rejection_reasons": reject_reasons,
            "predicted_class": str(predicted_class),
            "confidence": float(confidence),
            "all_probabilities": {
                disease: float(prob) 
                for disease, prob in zip(self.diseases, predictions)
            },
            "entropy": float(entropy),
            "is_leaf_like": bool(is_leaf_like)
        }
        
        if is_rejected:
            result["message"] = (
                "This image doesn't appear to be a banana leaf. "
                "Please upload an image of a banana leaf for disease classification."
            )
        else:
            result["message"] = (
                f"Detected: {predicted_class} with {confidence*100:.1f}% confidence"
            )
        
        return result

def test_classifier():
    """Test function to demonstrate the enhanced classifier."""
    try:
        classifier = BananaLeafClassifier(
            'saved_models/banana_mobilenetv2_final.keras'
        )
        print("✅ Enhanced Banana Leaf Classifier loaded successfully!")
        print(f"   Diseases: {classifier.diseases}")
        return classifier
    except Exception as e:
        print(f"❌ Error loading classifier: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    classifier = test_classifier()
