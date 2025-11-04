#!/usr/bin/env python3
"""
Debug script to compare local file vs URL-based image loading and preprocessing.
This will help identify why the same image gives different predictions.
"""

import requests
import numpy as np
from PIL import Image
import io
import sys
from enhanced_inference import BananaLeafClassifier

def load_image_from_file(filepath):
    """Load image from local file"""
    print(f"\n📁 Loading from FILE: {filepath}")
    image = Image.open(filepath)
    print(f"   Mode: {image.mode}, Size: {image.size}, Format: {image.format}")
    return image

def load_image_from_url(url):
    """Load image from URL"""
    print(f"\n🌐 Loading from URL: {url}")
    response = requests.get(url, timeout=10, stream=True)
    response.raise_for_status()
    image = Image.open(response.raw)
    print(f"   Mode: {image.mode}, Size: {image.size}, Format: {image.format}")
    return image

def compare_images(img1, img2, label1="Image 1", label2="Image 2"):
    """Compare two PIL images"""
    print(f"\n🔍 Comparing {label1} vs {label2}")
    print(f"   Mode match: {img1.mode == img2.mode} ({img1.mode} vs {img2.mode})")
    print(f"   Size match: {img1.size == img2.size} ({img1.size} vs {img2.size})")
    print(f"   Format match: {img1.format == img2.format} ({img1.format} vs {img2.format})")
    
    # Convert both to RGB for comparison
    if img1.mode != "RGB":
        img1 = img1.convert("RGB")
    if img2.mode != "RGB":
        img2 = img2.convert("RGB")
    
    # Compare pixel values
    arr1 = np.array(img1)
    arr2 = np.array(img2)
    
    print(f"\n📊 Pixel array statistics:")
    print(f"   {label1}: shape={arr1.shape}, dtype={arr1.dtype}, min={arr1.min()}, max={arr1.max()}, mean={arr1.mean():.2f}")
    print(f"   {label2}: shape={arr2.shape}, dtype={arr2.dtype}, min={arr2.min()}, max={arr2.max()}, mean={arr2.mean():.2f}")
    
    if arr1.shape == arr2.shape:
        diff = np.abs(arr1.astype(float) - arr2.astype(float))
        print(f"\n   Pixel difference: mean={diff.mean():.2f}, max={diff.max()}")
        
        # Check if images are identical
        if np.allclose(arr1, arr2, atol=1):
            print(f"   ✅ Images are virtually identical")
        else:
            print(f"   ⚠️ Images have differences (diff > 1 pixel value)")
    else:
        print(f"   ❌ Cannot compare - different shapes!")

def test_preprocessing(image, classifier, label="Image"):
    """Test preprocessing and prediction"""
    print(f"\n🔬 Testing preprocessing for {label}")
    
    # Preprocess
    img_array = classifier.preprocess_image(image)
    print(f"   Preprocessed shape: {img_array.shape}")
    print(f"   Preprocessed dtype: {img_array.dtype}")
    print(f"   Preprocessed range: [{img_array.min():.4f}, {img_array.max():.4f}]")
    print(f"   Preprocessed mean: {img_array.mean():.4f}")
    print(f"   Preprocessed std: {img_array.std():.4f}")
    
    # Predict
    result = classifier.predict_with_rejection(image)
    print(f"\n📊 Prediction results:")
    print(f"   Predicted: {result['predicted_class']}")
    print(f"   Confidence: {result['confidence']:.4f}")
    print(f"   Entropy: {result['entropy']:.4f}")
    print(f"   Is rejected: {result['is_rejected']}")
    print(f"   Is leaf-like: {result['is_leaf_like']}")
    
    if result['is_rejected']:
        print(f"   Rejection reasons: {result['rejection_reasons']}")
    
    print(f"\n   All probabilities:")
    for disease, prob in result['all_probabilities'].items():
        print(f"      {disease}: {prob:.4f} ({prob*100:.2f}%)")
    
    return result

def main():
    if len(sys.argv) < 2:
        print("Usage: python debug_image_issue.py <local_file_path> [image_url]")
        print("\nExample:")
        print("  python debug_image_issue.py my_image.jpg")
        print("  python debug_image_issue.py my_image.jpg https://example.com/my_image.jpg")
        sys.exit(1)
    
    local_path = sys.argv[1]
    image_url = sys.argv[2] if len(sys.argv) > 2 else None
    
    print("="*70)
    print("🔍 IMAGE LOADING AND PREPROCESSING DEBUG TOOL")
    print("="*70)
    
    # Load classifier
    print("\n🤖 Loading classifier...")
    try:
        classifier = BananaLeafClassifier('banana_disease_classification_model1.keras')
        print("   ✅ Classifier loaded successfully!")
    except Exception as e:
        print(f"   ❌ Error loading classifier: {e}")
        sys.exit(1)
    
    # Load local image
    try:
        local_image = load_image_from_file(local_path)
    except Exception as e:
        print(f"   ❌ Error loading local file: {e}")
        sys.exit(1)
    
    # Test local image
    print("\n" + "="*70)
    print("TEST 1: LOCAL FILE")
    print("="*70)
    result_local = test_preprocessing(local_image, classifier, "Local File")
    
    # If URL provided, test URL image
    if image_url:
        print("\n" + "="*70)
        print("TEST 2: URL-BASED IMAGE")
        print("="*70)
        
        try:
            url_image = load_image_from_url(image_url)
        except Exception as e:
            print(f"   ❌ Error loading from URL: {e}")
            sys.exit(1)
        
        result_url = test_preprocessing(url_image, classifier, "URL Image")
        
        # Compare images
        print("\n" + "="*70)
        print("COMPARISON: LOCAL vs URL")
        print("="*70)
        compare_images(local_image, url_image, "Local File", "URL Image")
        
        # Compare results
        print("\n📊 Prediction Comparison:")
        print(f"   Local - Predicted: {result_local['predicted_class']}, Confidence: {result_local['confidence']:.4f}, Rejected: {result_local['is_rejected']}")
        print(f"   URL   - Predicted: {result_url['predicted_class']}, Confidence: {result_url['confidence']:.4f}, Rejected: {result_url['is_rejected']}")
        
        if result_local['predicted_class'] != result_url['predicted_class'] or \
           abs(result_local['confidence'] - result_url['confidence']) > 0.05:
            print("\n   ⚠️ WARNING: Significant difference detected!")
            print("\n   Possible causes:")
            print("   1. Different image encoding/compression from URL")
            print("   2. Color space conversion issues")
            print("   3. Different image metadata")
            print("   4. Network-related image corruption")
        else:
            print("\n   ✅ Results are consistent!")
    
    print("\n" + "="*70)
    print("✅ Debug complete!")
    print("="*70)

if __name__ == "__main__":
    main()
