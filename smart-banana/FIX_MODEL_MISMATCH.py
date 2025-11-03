#!/usr/bin/env python3
"""
Script to diagnose and fix the model mismatch issue between local and deployed predictions.
"""

import os
import sys
import hashlib
import tensorflow as tf
from PIL import Image
import numpy as np
from enhanced_inference import BananaLeafClassifier

def compute_file_hash(filepath):
    """Compute SHA256 hash of a file"""
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def check_model_files():
    """Check which model files exist and their hashes"""
    print("🔍 Checking model files...")
    print("=" * 60)
    
    model_files = [
        "banana_disease_classification_model.keras",
        "banana_disease_classification_model1.keras",
        "banana_disease_classification_model.json",
        "banana_disease_classification_weights.h5"
    ]
    
    found_models = []
    
    for model_file in model_files:
        if os.path.exists(model_file):
            size = os.path.getsize(model_file)
            file_hash = compute_file_hash(model_file)
            found_models.append(model_file)
            print(f"✅ Found: {model_file}")
            print(f"   Size: {size:,} bytes ({size / 1024 / 1024:.2f} MB)")
            print(f"   SHA256: {file_hash[:16]}...")
            print()
        else:
            print(f"❌ Not found: {model_file}")
            print()
    
    return found_models

def test_model_prediction(model_path, test_image_path):
    """Test a specific model with an image"""
    print(f"\n🧪 Testing model: {model_path}")
    print("-" * 60)
    
    try:
        # Load classifier
        classifier = BananaLeafClassifier(model_path)
        print("✅ Model loaded successfully")
        
        # Load test image
        if os.path.exists(test_image_path):
            image = Image.open(test_image_path)
            print(f"✅ Test image loaded: {test_image_path}")
        else:
            print(f"❌ Test image not found: {test_image_path}")
            return None
        
        # Make prediction
        result = classifier.predict_with_rejection(image)
        
        print(f"\nPrediction Results:")
        print(f"  Rejected: {result['is_rejected']}")
        print(f"  Predicted: {result['predicted_class']}")
        print(f"  Confidence: {result['confidence']:.4f}")
        print(f"  Entropy: {result['entropy']:.4f}")
        print(f"  Is leaf-like: {result['is_leaf_like']}")
        print(f"\n  All probabilities:")
        for disease, prob in result['all_probabilities'].items():
            print(f"    {disease}: {prob:.4f} ({prob*100:.2f}%)")
        
        return result
        
    except Exception as e:
        print(f"❌ Error testing model: {e}")
        import traceback
        traceback.print_exc()
        return None

def compare_models(test_image_path):
    """Compare predictions from both model files"""
    print("\n🔬 Comparing model predictions...")
    print("=" * 60)
    
    models = [
        "banana_disease_classification_model.keras",
        "banana_disease_classification_model1.keras"
    ]
    
    results = {}
    for model in models:
        if os.path.exists(model):
            result = test_model_prediction(model, test_image_path)
            results[model] = result
        else:
            print(f"\n⚠️  Skipping {model} (not found)")
    
    # Compare results
    if len(results) == 2:
        print("\n📊 Comparison Summary:")
        print("=" * 60)
        
        model1, model2 = list(results.keys())
        result1, result2 = results[model1], results[model2]
        
        if result1 and result2:
            print(f"\n{model1}:")
            print(f"  Predicted: {result1['predicted_class']} ({result1['confidence']*100:.2f}%)")
            print(f"  Rejected: {result1['is_rejected']}")
            
            print(f"\n{model2}:")
            print(f"  Predicted: {result2['predicted_class']} ({result2['confidence']*100:.2f}%)")
            print(f"  Rejected: {result2['is_rejected']}")
            
            # Check if predictions match
            if result1['predicted_class'] == result2['predicted_class']:
                print("\n✅ Both models predict the SAME class")
                if abs(result1['confidence'] - result2['confidence']) < 0.05:
                    print("✅ Confidence scores are SIMILAR")
                else:
                    print(f"⚠️  Confidence scores DIFFER: {abs(result1['confidence'] - result2['confidence']):.4f}")
            else:
                print("\n❌ Models predict DIFFERENT classes!")
                print("   This explains the mismatch between local and deployed versions.")
                
                # Determine which is likely correct
                if result1['confidence'] > result2['confidence']:
                    print(f"\n💡 {model1} has higher confidence")
                    print(f"   Consider using this model for deployment")
                else:
                    print(f"\n💡 {model2} has higher confidence")
                    print(f"   Consider using this model for deployment")
    
    return results

def check_server_config():
    """Check server.py configuration"""
    print("\n📝 Checking server.py configuration...")
    print("=" * 60)
    
    try:
        with open('server.py', 'r') as f:
            content = f.read()
            
        # Find model path line
        for i, line in enumerate(content.split('\n')):
            if 'MODEL_PATH' in line and '=' in line and '#' not in line[:line.find('MODEL_PATH')]:
                print(f"Line {i+1}: {line.strip()}")
                
                if 'model1.keras' in line:
                    print("⚠️  Using model1.keras in server.py")
                elif 'model.keras' in line and 'model1' not in line:
                    print("✅ Using model.keras in server.py")
                    
    except Exception as e:
        print(f"❌ Error checking server.py: {e}")

def generate_fix_recommendations(results):
    """Generate specific fix recommendations"""
    print("\n🔧 Fix Recommendations:")
    print("=" * 60)
    
    # Check which model exists and works better
    if os.path.exists("banana_disease_classification_model.keras"):
        model_to_use = "banana_disease_classification_model.keras"
    elif os.path.exists("banana_disease_classification_model1.keras"):
        model_to_use = "banana_disease_classification_model1.keras"
    else:
        print("❌ No model files found!")
        return
    
    # Check if we have comparison results
    if results and len(results) == 2:
        # Use the one with higher confidence
        confidences = {k: v['confidence'] if v else 0 for k, v in results.items()}
        best_model = max(confidences, key=confidences.get)
        model_to_use = best_model
        
        print(f"\n1. Based on testing, use: {model_to_use}")
        print(f"   (It has the highest confidence: {confidences[best_model]*100:.2f}%)")
    else:
        print(f"\n1. Use the existing model: {model_to_use}")
    
    print(f"\n2. Update server.py:")
    print(f'   Change MODEL_PATH line to:')
    print(f'   MODEL_PATH = os.path.join(BASE_DIR, "{model_to_use}")')
    
    print(f"\n3. Ensure the same model is used in all files:")
    print(f"   - server.py")
    print(f"   - enhanced_inference.py")
    print(f"   - app.py")
    
    print(f"\n4. Copy the working model to have a backup:")
    if model_to_use == "banana_disease_classification_model1.keras":
        print(f"   copy {model_to_use} banana_disease_classification_model.keras")
    
    print(f"\n5. Test locally before deploying:")
    print(f"   python server.py")
    print(f"   python test_api.py")
    
    print(f"\n6. Commit and push changes:")
    print(f"   git add server.py {model_to_use}")
    print(f"   git commit -m \"Fix model mismatch issue\"")
    print(f"   git push")
    
    print(f"\n7. Deploy to Render and test")

def main():
    """Main diagnosis function"""
    print("🏥 Banana Disease Model Mismatch Diagnostic Tool")
    print("=" * 60)
    print()
    
    # Step 1: Check model files
    found_models = check_model_files()
    
    if not found_models:
        print("\n❌ No model files found!")
        print("Please ensure model files are in the current directory.")
        return
    
    # Step 2: Check server configuration
    check_server_config()
    
    # Step 3: Ask for test image
    print("\n📸 Test Image Selection:")
    print("=" * 60)
    
    test_images = [f for f in os.listdir('.') if f.endswith(('.jpg', '.jpeg', '.png')) and f.startswith(('0', '1', '2', '5'))]
    
    if test_images:
        print(f"Found {len(test_images)} test images:")
        for i, img in enumerate(test_images[:5], 1):
            print(f"  {i}. {img}")
        
        test_image = test_images[0]
        print(f"\nUsing: {test_image}")
    else:
        print("⚠️  No test images found in current directory")
        print("Please provide a test image path:")
        test_image = input("Image path: ").strip()
        
        if not test_image or not os.path.exists(test_image):
            print("❌ Invalid image path. Using simulated test...")
            test_image = None
    
    # Step 4: Compare models if test image available
    results = {}
    if test_image:
        results = compare_models(test_image)
    
    # Step 5: Generate recommendations
    generate_fix_recommendations(results)
    
    print("\n✅ Diagnostic complete!")
    print("\nFor questions or issues, check DIAGNOSIS_AND_FIX.md")

if __name__ == "__main__":
    main()
