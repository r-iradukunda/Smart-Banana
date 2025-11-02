import os
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
from enhanced_inference import BananaLeafClassifier
import json

def test_classifier_with_examples():
    """
    Test the enhanced classifier with various types of images
    """
    # Initialize classifier
    classifier = BananaLeafClassifier('banana_disease_classification_model.keras')
    
    print("🍌 Testing Enhanced Banana Leaf Classifier")
    print("=" * 50)
    
    # Test with a sample from the training data if available
    test_images = []
    
    # Look for test images in the uploads folder
    uploads_path = "uploads"
    if os.path.exists(uploads_path):
        for file in os.listdir(uploads_path):
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                test_images.append(os.path.join(uploads_path, file))
    
    # If no test images found, create a simple test
    if not test_images:
        print("No test images found in uploads folder.")
        print("To test the rejection capability, try uploading:")
        print("1. Clear banana leaf images (should be accepted)")
        print("2. Non-leaf images like cars, people, buildings (should be rejected)")
        print("3. Other plant leaves (should be rejected)")
        print("4. Blurry or unclear images (should be rejected)")
        return
    
    # Test each image
    for i, image_path in enumerate(test_images[:5]):  # Test first 5 images
        print(f"\n📷 Testing Image {i+1}: {os.path.basename(image_path)}")
        print("-" * 40)
        
        try:
            # Load and test image
            image = Image.open(image_path)
            result = classifier.predict_with_rejection(image)
            
            if result["is_rejected"]:
                print("❌ REJECTED")
                print(f"Reason: {result['message']}")
                print("Rejection details:")
                for reason in result["rejection_reasons"]:
                    print(f"  • {reason}")
            else:
                print("✅ ACCEPTED")
                print(f"Prediction: {result['predicted_class'].title()}")
                print(f"Confidence: {result['confidence']*100:.1f}%")
                print(f"Certainty: {(1-result['entropy']/2)*100:.1f}%")
                
        except Exception as e:
            print(f"Error processing {image_path}: {e}")

def create_test_report():
    """
    Create a comprehensive test report for the enhanced classifier
    """
    classifier = BananaLeafClassifier('banana_disease_classification_model.keras')
    
    report = {
        "model_info": {
            "diseases": classifier.diseases,
            "thresholds": {
                "min_confidence": classifier.min_confidence_threshold,
                "max_entropy": classifier.max_entropy_threshold,
                "feature_similarity": classifier.feature_similarity_threshold
            }
        },
        "features": [
            "Multi-class disease classification",
            "Out-of-distribution detection",
            "Confidence-based rejection",
            "Entropy-based uncertainty detection",
            "Color-based leaf detection"
        ],
        "rejection_criteria": [
            f"Confidence below {classifier.min_confidence_threshold}",
            f"Entropy above {classifier.max_entropy_threshold}",
            "Non-leaf-like color distribution"
        ]
    }
    
    # Save report
    with open('enhanced_model_report.json', 'w') as f:
        json.dump(report, f, indent=2)
    
    print("📊 Enhanced Model Report Generated")
    print("=" * 40)
    print(f"Diseases detected: {len(classifier.diseases)}")
    print(f"Rejection criteria: {len(report['rejection_criteria'])}")
    print(f"Enhanced features: {len(report['features'])}")
    print("\nReport saved to 'enhanced_model_report.json'")
    
    return report

def demonstrate_rejection_logic():
    """
    Demonstrate how the rejection logic works
    """
    print("🧠 Rejection Logic Demonstration")
    print("=" * 40)
    
    print("\n1. Confidence Threshold:")
    print("   - If max prediction confidence < 0.6 → REJECT")
    print("   - Reason: Model is not confident enough")
    
    print("\n2. Entropy Threshold:")
    print("   - If prediction entropy > 1.2 → REJECT")
    print("   - Reason: High uncertainty across all classes")
    
    print("\n3. Color Analysis:")
    print("   - If green pixel ratio < 15% → REJECT")
    print("   - Reason: Doesn't look like a leaf")
    
    print("\n4. Combined Decision:")
    print("   - ANY rejection criterion met → REJECT")
    print("   - ALL criteria passed → ACCEPT")
    
    print("\n✅ Benefits:")
    print("   • Prevents misclassification of non-leaf images")
    print("   • Provides clear feedback to users")
    print("   • Maintains high accuracy for valid inputs")
    print("   • Reduces false positive predictions")

def validate_model_improvements():
    """
    Validate that the model improvements are working correctly
    """
    print("🔍 Model Validation")
    print("=" * 30)
    
    try:
        classifier = BananaLeafClassifier('banana_disease_classification_model.keras')
        print("✅ Enhanced classifier loaded successfully")
        
        # Test that all methods work
        dummy_image = Image.new('RGB', (224, 224), color='green')
        result = classifier.predict_with_rejection(dummy_image)
        
        required_keys = ['is_rejected', 'predicted_class', 'confidence', 'entropy', 'is_leaf_like']
        missing_keys = [key for key in required_keys if key not in result]
        
        if missing_keys:
            print(f"❌ Missing keys in result: {missing_keys}")
        else:
            print("✅ All required result keys present")
        
        print(f"✅ Diseases available: {len(classifier.diseases)}")
        print(f"✅ Thresholds configured: {classifier.min_confidence_threshold}, {classifier.max_entropy_threshold}")
        
        return True
        
    except Exception as e:
        print(f"❌ Validation failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Enhanced Banana Leaf Classifier Test Suite")
    print("=" * 50)
    
    # Run validation
    if validate_model_improvements():
        print("\n" + "="*50)
        demonstrate_rejection_logic()
        print("\n" + "="*50)
        create_test_report()
        print("\n" + "="*50)
        test_classifier_with_examples()
    else:
        print("❌ Validation failed. Please check the model and dependencies.")
