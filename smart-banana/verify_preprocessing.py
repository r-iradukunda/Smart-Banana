#!/usr/bin/env python3
"""
Quick script to verify preprocessing consistency and test model predictions.
"""

import numpy as np
from PIL import Image
import requests
import json
import sys

def test_preprocessing(image_path):
    """Test if preprocessing matches training"""
    print("🔬 Testing Image Preprocessing")
    print("=" * 60)
    
    # Load image
    image = Image.open(image_path)
    print(f"✅ Image loaded: {image_path}")
    print(f"   Original size: {image.size}")
    print(f"   Mode: {image.mode}")
    
    # Resize
    image_resized = image.resize((224, 224))
    print(f"✅ Resized to: {image_resized.size}")
    
    # Convert to array
    img_array = np.array(image_resized)
    print(f"✅ Array shape: {img_array.shape}")
    print(f"   Data type: {img_array.dtype}")
    print(f"   Value range: [{img_array.min()}, {img_array.max()}]")
    
    # Normalize (THIS IS CRITICAL!)
    img_normalized = img_array / 255.0
    print(f"✅ Normalized: [{img_normalized.min():.3f}, {img_normalized.max():.3f}]")
    
    # Check statistics
    print(f"\n📊 Normalized Image Statistics:")
    print(f"   Mean: {np.mean(img_normalized):.4f}")
    print(f"   Std Dev: {np.std(img_normalized):.4f}")
    print(f"   Median: {np.median(img_normalized):.4f}")
    
    # Expected values for banana leaf (greenish)
    print(f"\n🍃 Color Analysis:")
    print(f"   Red channel mean: {np.mean(img_normalized[:,:,0]):.4f}")
    print(f"   Green channel mean: {np.mean(img_normalized[:,:,1]):.4f}")
    print(f"   Blue channel mean: {np.mean(img_normalized[:,:,2]):.4f}")
    
    if np.mean(img_normalized[:,:,1]) > np.mean(img_normalized[:,:,0]):
        print("   ✅ Image appears greenish (as expected for leaves)")
    else:
        print("   ⚠️  Image doesn't appear very green")
    
    return img_normalized

def test_local_prediction(image_path):
    """Test prediction with local model"""
    print("\n🏠 Testing Local Prediction")
    print("=" * 60)
    
    try:
        from enhanced_inference import BananaLeafClassifier
        
        # Try both model files
        for model_file in ['banana_disease_classification_model1.keras', 
                          'banana_disease_classification_model.keras']:
            try:
                print(f"\n📦 Loading model: {model_file}")
                classifier = BananaLeafClassifier(model_file)
                
                image = Image.open(image_path)
                result = classifier.predict_with_rejection(image)
                
                print(f"✅ Prediction complete")
                print(f"   Predicted: {result['predicted_class']}")
                print(f"   Confidence: {result['confidence']:.4f} ({result['confidence']*100:.2f}%)")
                print(f"   Rejected: {result['is_rejected']}")
                print(f"   Entropy: {result['entropy']:.4f}")
                
                if not result['is_rejected']:
                    print(f"\n   All probabilities:")
                    for disease, prob in result['all_probabilities'].items():
                        bar = "█" * int(prob * 50)
                        print(f"     {disease:15s}: {prob:.4f} {bar}")
                else:
                    print(f"   Rejection reasons: {result['rejection_reasons']}")
                
            except FileNotFoundError:
                print(f"   ⚠️  Model file not found: {model_file}")
            except Exception as e:
                print(f"   ❌ Error: {e}")
                
    except Exception as e:
        print(f"❌ Error loading classifier: {e}")

def test_api_prediction(image_path, api_url="http://localhost:5000"):
    """Test prediction via API"""
    print(f"\n🌐 Testing API Prediction: {api_url}")
    print("=" * 60)
    
    try:
        # Test health first
        response = requests.get(f"{api_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ API is healthy")
        else:
            print(f"⚠️  Health check returned: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Cannot connect to {api_url}")
        print("   Make sure server is running: python server.py")
        return
    except Exception as e:
        print(f"❌ Error: {e}")
        return
    
    # Make prediction
    try:
        with open(image_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(f"{api_url}/predict", files=files, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Prediction complete")
            
            if result.get('is_rejected'):
                print(f"   Status: REJECTED")
                print(f"   Message: {result.get('message')}")
                print(f"   Reasons: {result.get('rejection_reasons')}")
                
                tech = result.get('technical_details', {})
                print(f"\n   Technical details:")
                print(f"     Predicted: {tech.get('predicted_class')}")
                print(f"     Confidence: {tech.get('confidence', 0):.4f}")
                print(f"     Entropy: {tech.get('entropy', 0):.4f}")
                
            else:
                print(f"   Status: ACCEPTED")
                print(f"   Predicted: {result.get('predicted_disease')}")
                print(f"   Confidence: {result.get('confidence')}")
                
                print(f"\n   All probabilities:")
                probs = result.get('raw_probabilities', {})
                for disease, prob in probs.items():
                    bar = "█" * int(prob * 50)
                    print(f"     {disease:15s}: {prob:.4f} {bar}")
                    
        else:
            print(f"❌ Prediction failed: {response.status_code}")
            try:
                error = response.json()
                print(f"   Error: {error}")
            except:
                print(f"   Response: {response.text}")
                
    except Exception as e:
        print(f"❌ Error making prediction: {e}")

def compare_predictions(image_path):
    """Compare local vs API predictions"""
    print("\n🔬 Comparison Summary")
    print("=" * 60)
    
    # This would need more sophisticated comparison
    # For now, just remind user to check
    print("""
    Manual Verification Steps:
    
    1. Check that local model predicts: pestalotiopsis (~89% confidence)
    2. Check that API also predicts: pestalotiopsis (~89% confidence)
    3. If they differ, there's still a mismatch issue
    
    Common causes if still mismatched:
    - Different model files (check file hashes)
    - Different preprocessing (check normalization)
    - Different TensorFlow versions
    - Model caching issues
    """)

def main():
    """Main test function"""
    print("🧪 Preprocessing and Prediction Verification")
    print("=" * 60)
    print()
    
    if len(sys.argv) < 2:
        print("Usage: python verify_preprocessing.py <image_path> [api_url]")
        print("\nExample:")
        print("  python verify_preprocessing.py test_image.jpg")
        print("  python verify_preprocessing.py test_image.jpg http://localhost:5000")
        sys.exit(1)
    
    image_path = sys.argv[1]
    api_url = sys.argv[2] if len(sys.argv) > 2 else "http://localhost:5000"
    
    # Step 1: Test preprocessing
    test_preprocessing(image_path)
    
    # Step 2: Test local prediction
    test_local_prediction(image_path)
    
    # Step 3: Test API prediction
    test_api_prediction(image_path, api_url)
    
    # Step 4: Comparison
    compare_predictions(image_path)
    
    print("\n✅ Verification complete!")
    print("\n💡 Next steps:")
    print("   1. Verify both predictions are the same")
    print("   2. If different, run: python FIX_MODEL_MISMATCH.py")
    print("   3. Check model file hashes match")
    print("   4. Review preprocessing in enhanced_inference.py")

if __name__ == "__main__":
    main()
