"""
Quick script to verify image preprocessing produces identical results
"""
import numpy as np
from PIL import Image
from enhanced_inference import BananaLeafClassifier
import requests
from io import BytesIO

def load_image_from_file(file_path):
    """Load image from local file"""
    print(f"\n📁 Loading from file: {file_path}")
    image = Image.open(file_path)
    image.load()
    print(f"   Mode: {image.mode}, Size: {image.size}")
    return image

def load_image_from_url(url):
    """Load image from URL"""
    print(f"\n🌐 Loading from URL: {url}")
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
    }
    response = requests.get(url, timeout=15, headers=headers, allow_redirects=True)
    response.raise_for_status()
    
    image_bytes = BytesIO(response.content)
    image = Image.open(image_bytes)
    image.load()
    print(f"   Mode: {image.mode}, Size: {image.size}")
    return image

def compare_preprocessing(image1, image2, classifier):
    """Compare preprocessing output for two images"""
    print("\n🔍 Preprocessing both images...")
    
    # Preprocess both images
    array1 = classifier.preprocess_image(image1)
    array2 = classifier.preprocess_image(image2)
    
    print(f"\n📊 Array 1 stats:")
    print(f"   Shape: {array1.shape}")
    print(f"   Dtype: {array1.dtype}")
    print(f"   Range: [{array1.min():.6f}, {array1.max():.6f}]")
    print(f"   Mean: {array1.mean():.6f}")
    print(f"   Std: {array1.std():.6f}")
    
    print(f"\n📊 Array 2 stats:")
    print(f"   Shape: {array2.shape}")
    print(f"   Dtype: {array2.dtype}")
    print(f"   Range: [{array2.min():.6f}, {array2.max():.6f}]")
    print(f"   Mean: {array2.mean():.6f}")
    print(f"   Std: {array2.std():.6f}")
    
    # Calculate difference
    diff = np.abs(array1 - array2)
    max_diff = diff.max()
    mean_diff = diff.mean()
    
    print(f"\n🔢 Difference Statistics:")
    print(f"   Max difference: {max_diff:.10f}")
    print(f"   Mean difference: {mean_diff:.10f}")
    print(f"   Std difference: {diff.std():.10f}")
    
    # Check if arrays are identical
    if max_diff < 1e-7:
        print(f"\n✅ Arrays are IDENTICAL (difference < 1e-7)")
        return True
    elif max_diff < 1e-5:
        print(f"\n✅ Arrays are NEARLY IDENTICAL (difference < 1e-5)")
        return True
    elif max_diff < 1e-3:
        print(f"\n⚠️ Arrays are SIMILAR but not identical (difference < 1e-3)")
        return False
    else:
        print(f"\n❌ Arrays are DIFFERENT (difference >= 1e-3)")
        return False

def compare_predictions(image1, image2, classifier):
    """Compare predictions for two images"""
    print("\n🎯 Making predictions...")
    
    result1 = classifier.predict_with_rejection(image1)
    result2 = classifier.predict_with_rejection(image2)
    
    print(f"\n📈 Prediction 1:")
    print(f"   Predicted: {result1['predicted_class']}")
    print(f"   Confidence: {result1['confidence']:.6f}")
    print(f"   Entropy: {result1['entropy']:.6f}")
    print(f"   Rejected: {result1['is_rejected']}")
    
    print(f"\n📈 Prediction 2:")
    print(f"   Predicted: {result2['predicted_class']}")
    print(f"   Confidence: {result2['confidence']:.6f}")
    print(f"   Entropy: {result2['entropy']:.6f}")
    print(f"   Rejected: {result2['is_rejected']}")
    
    # Compare results
    print(f"\n🔍 Comparison:")
    
    same_class = result1['predicted_class'] == result2['predicted_class']
    print(f"   Same class: {'✅' if same_class else '❌'}")
    
    same_rejection = result1['is_rejected'] == result2['is_rejected']
    print(f"   Same rejection status: {'✅' if same_rejection else '❌'}")
    
    conf_diff = abs(result1['confidence'] - result2['confidence'])
    print(f"   Confidence difference: {conf_diff:.6f} {'✅' if conf_diff < 0.01 else '⚠️' if conf_diff < 0.1 else '❌'}")
    
    entropy_diff = abs(result1['entropy'] - result2['entropy'])
    print(f"   Entropy difference: {entropy_diff:.6f} {'✅' if entropy_diff < 0.1 else '⚠️' if entropy_diff < 0.5 else '❌'}")
    
    # Check all probabilities
    print(f"\n📊 Probability Comparison:")
    for disease in ['cordana', 'healthy', 'pestalotiopsis', 'sigatoka']:
        p1 = result1['all_probabilities'][disease]
        p2 = result2['all_probabilities'][disease]
        diff = abs(p1 - p2)
        status = '✅' if diff < 0.01 else '⚠️' if diff < 0.1 else '❌'
        print(f"   {disease:15s}: {p1:.6f} vs {p2:.6f} (diff: {diff:.6f}) {status}")
    
    return same_class and same_rejection and conf_diff < 0.05 and entropy_diff < 0.2

def main():
    print("="*70)
    print("🍌 Image Processing Consistency Verification")
    print("="*70)
    
    # Load classifier
    try:
        classifier = BananaLeafClassifier('banana_disease_classification_model1.keras')
        print("✅ Classifier loaded successfully")
    except Exception as e:
        print(f"❌ Failed to load classifier: {e}")
        return
    
    # Get input from user
    print("\n" + "-"*70)
    file_path = input("Enter path to test image file (e.g., 0.jpeg): ").strip()
    
    if not file_path:
        file_path = "0.jpeg"  # Default
        print(f"Using default: {file_path}")
    
    try:
        # Load from file
        image_from_file = load_image_from_file(file_path)
        
        # Ask if user wants to test URL too
        test_url = input("\nDo you want to test URL loading? (y/n): ").strip().lower()
        
        if test_url == 'y':
            url = input("Enter image URL: ").strip()
            if url:
                image_from_url = load_image_from_url(url)
                
                # Compare preprocessing
                print("\n" + "="*70)
                print("COMPARING FILE vs URL LOADING")
                print("="*70)
                
                arrays_match = compare_preprocessing(image_from_file, image_from_url, classifier)
                predictions_match = compare_predictions(image_from_file, image_from_url, classifier)
                
                print("\n" + "="*70)
                print("FINAL RESULT")
                print("="*70)
                
                if arrays_match and predictions_match:
                    print("✅ SUCCESS: File and URL loading produce identical results!")
                elif arrays_match:
                    print("⚠️ PARTIAL SUCCESS: Preprocessing is identical but predictions differ slightly")
                elif predictions_match:
                    print("⚠️ PARTIAL SUCCESS: Predictions match but preprocessing differs slightly")
                else:
                    print("❌ FAILURE: File and URL loading produce different results")
                    print("   This indicates an issue that needs to be fixed!")
            else:
                print("No URL provided, skipping URL test")
                # Just test file loading
                result = classifier.predict_with_rejection(image_from_file)
                print(f"\n✅ File loading works: {result['predicted_class']} ({result['confidence']:.2%})")
        else:
            # Just test file loading
            result = classifier.predict_with_rejection(image_from_file)
            print(f"\n✅ File loading works: {result['predicted_class']} ({result['confidence']:.2%})")
            
    except FileNotFoundError:
        print(f"❌ Error: File not found: {file_path}")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
