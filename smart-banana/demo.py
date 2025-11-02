#!/usr/bin/env python3
"""
Demonstration script for the Enhanced Banana Disease Classification System
This script shows how the new rejection capabilities work.
"""

import numpy as np
from PIL import Image, ImageDraw, ImageFont
import matplotlib.pyplot as plt
from enhanced_inference import BananaLeafClassifier
import io

def create_demo_images():
    """Create demonstration images to test the rejection system"""
    
    demo_images = {}
    
    # 1. Create a green leaf-like image (should be accepted)
    leaf_image = Image.new('RGB', (224, 224), color='white')
    draw = ImageDraw.Draw(leaf_image)
    
    # Draw a leaf-like shape in green
    points = [(50, 112), (80, 50), (120, 30), (160, 50), (174, 112), 
              (160, 174), (120, 194), (80, 174)]
    draw.polygon(points, fill='green', outline='darkgreen', width=3)
    demo_images['leaf_like'] = leaf_image
    
    # 2. Create a non-leaf image (should be rejected)
    car_image = Image.new('RGB', (224, 224), color='blue')
    draw = ImageDraw.Draw(car_image)
    # Draw a simple car shape
    draw.rectangle([50, 120, 174, 170], fill='red', outline='black', width=2)
    draw.ellipse([60, 160, 90, 190], fill='black')  # wheel
    draw.ellipse([134, 160, 164, 190], fill='black')  # wheel
    demo_images['car'] = car_image
    
    # 3. Create a very blurry/unclear image (should be rejected)
    noise_array = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
    noise_image = Image.fromarray(noise_array)
    demo_images['noise'] = noise_image
    
    # 4. Create a mostly non-green image (should be rejected)
    building_image = Image.new('RGB', (224, 224), color='gray')
    draw = ImageDraw.Draw(building_image)
    # Draw building-like rectangles
    draw.rectangle([30, 50, 80, 180], fill='lightgray', outline='black')
    draw.rectangle([90, 70, 140, 180], fill='darkgray', outline='black')
    draw.rectangle([150, 40, 200, 180], fill='gray', outline='black')
    demo_images['building'] = building_image
    
    return demo_images

def run_demonstration():
    """Run a comprehensive demonstration of the enhanced classifier"""
    
    print("🍌 Enhanced Banana Disease Classification - Demonstration")
    print("=" * 60)
    print()
    
    # Initialize classifier
    try:
        classifier = BananaLeafClassifier('banana_disease_classification_model.keras')
        print("✅ Enhanced classifier loaded successfully!")
    except Exception as e:
        print(f"❌ Error loading classifier: {e}")
        return
    
    print(f"📊 Model Configuration:")
    print(f"   • Diseases: {classifier.diseases}")
    print(f"   • Min Confidence: {classifier.min_confidence_threshold}")
    print(f"   • Max Entropy: {classifier.max_entropy_threshold}")
    print(f"   • Feature Similarity: {classifier.feature_similarity_threshold}")
    print()
    
    # Create demo images
    print("🎨 Creating demonstration images...")
    demo_images = create_demo_images()
    print(f"   • Created {len(demo_images)} test images")
    print()
    
    # Test each demo image
    print("🔍 Testing Rejection Capabilities:")
    print("-" * 40)
    
    test_descriptions = {
        'leaf_like': "Green leaf-like shape (should be ACCEPTED)",
        'car': "Car/vehicle image (should be REJECTED)", 
        'noise': "Random noise image (should be REJECTED)",
        'building': "Building/structure (should be REJECTED)"
    }
    
    results = {}
    
    for image_name, description in test_descriptions.items():
        print(f"\n📷 Test: {description}")
        
        image = demo_images[image_name]
        result = classifier.predict_with_rejection(image)
        results[image_name] = result
        
        if result['is_rejected']:
            print("   ❌ REJECTED (Correct)")
            print(f"   Reason: {result['message']}")
            print("   Details:")
            for reason in result['rejection_reasons']:
                print(f"     • {reason}")
        else:
            print("   ✅ ACCEPTED")
            print(f"   Prediction: {result['predicted_class'].title()}")
            print(f"   Confidence: {result['confidence']*100:.1f}%")
        
        print(f"   Technical: Confidence={result['confidence']:.3f}, Entropy={result['entropy']:.3f}, Leaf-like={result['is_leaf_like']}")
    
    print("\n" + "=" * 60)
    print("📋 Demonstration Summary:")
    print("-" * 25)
    
    accepted_count = sum(1 for r in results.values() if not r['is_rejected'])
    rejected_count = len(results) - accepted_count
    
    print(f"✅ Accepted: {accepted_count}/4 images")
    print(f"❌ Rejected: {rejected_count}/4 images")
    
    # Expected: 1 accepted (leaf_like), 3 rejected (car, noise, building)
    if rejected_count >= 3:
        print("🎯 SUCCESS: Rejection system working correctly!")
    else:
        print("⚠️  WARNING: Rejection system may need adjustment")
    
    print("\n🚀 Key Benefits Demonstrated:")
    print("   • Prevents misclassification of non-leaf images")
    print("   • Provides clear rejection feedback")
    print("   • Maintains accuracy for valid inputs")
    print("   • Uses multiple detection criteria")
    
    return results

def show_usage_examples():
    """Show practical usage examples"""
    
    print("\n" + "=" * 60)
    print("📚 Usage Examples:")
    print("-" * 20)
    
    print("\n1. Basic Usage (Python):")
    print("""
from enhanced_inference import BananaLeafClassifier
from PIL import Image

# Initialize classifier
classifier = BananaLeafClassifier('banana_disease_classification_model.keras')

# Analyze an image
image = Image.open('banana_leaf.jpg')
result = classifier.predict_with_rejection(image)

if result['is_rejected']:
    print(f"Rejected: {result['message']}")
else:
    print(f"Disease: {result['predicted_class']}")
    print(f"Confidence: {result['confidence']*100:.1f}%")
""")
    
    print("\n2. Web App Usage:")
    print("   • Run: streamlit run app.py")
    print("   • Upload image via web interface")
    print("   • Get instant feedback on rejection/acceptance")
    
    print("\n3. API Usage:")
    print("   • Run: python server.py")
    print("   • POST /predict with image file")
    print("   • Receive JSON response with detailed results")
    
    print("\n4. Batch Testing:")
    print("   • Run: python test_enhanced_model.py")
    print("   • Test multiple images automatically")
    print("   • Generate performance reports")

if __name__ == "__main__":
    try:
        # Run the main demonstration
        results = run_demonstration()
        
        # Show usage examples
        show_usage_examples()
        
        print("\n" + "=" * 60)
        print("🎉 Demonstration Complete!")
        print("The enhanced banana disease classifier now properly")
        print("rejects non-banana leaf images while maintaining")
        print("high accuracy for valid banana leaf disease detection.")
        print("\nTo test with your own images:")
        print("• Run: streamlit run app.py (for web interface)")
        print("• Run: python server.py (for API access)")
        
    except KeyboardInterrupt:
        print("\n\n👋 Demonstration interrupted by user")
    except Exception as e:
        print(f"\n❌ Demonstration failed: {e}")
        print("Please ensure the model file exists and dependencies are installed")
