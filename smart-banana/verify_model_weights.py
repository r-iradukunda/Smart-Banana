#!/usr/bin/env python3
"""
Quick script to verify if a model has been properly trained or has random weights.
"""

import numpy as np
import tensorflow as tf
from PIL import Image
import sys
import os

def check_model_weights(model_path):
    """Check if model has trained weights or random initialization"""
    print(f"🔍 Checking model: {model_path}")
    print("=" * 60)
    
    # Check file exists
    if not os.path.exists(model_path):
        print(f"❌ Model file not found: {model_path}")
        return False
    
    # Check file size
    size = os.path.getsize(model_path)
    print(f"✅ File exists")
    print(f"   Size: {size:,} bytes ({size/1024/1024:.2f} MB)")
    
    if size < 10_000_000:  # Less than 10 MB
        print("⚠️  WARNING: File seems very small for a trained model!")
        print("   This might be corrupted or an error page")
        return False
    
    # Load model
    try:
        print("\n📦 Loading model...")
        model = tf.keras.models.load_model(model_path, compile=False)
        print("✅ Model loaded successfully")
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        return False
    
    # Print architecture
    print(f"\n🏗️  Model Architecture:")
    print(f"   Total parameters: {model.count_params():,}")
    print(f"   Layers: {len(model.layers)}")
    print(f"   Input shape: {model.input_shape}")
    print(f"   Output shape: {model.output_shape}")
    
    # Check weights statistics
    print(f"\n📊 Weight Statistics:")
    all_weights = []
    for i, layer in enumerate(model.layers):
        weights = layer.get_weights()
        if weights:
            w = weights[0]  # Get the main weight matrix
            all_weights.extend(w.flatten())
            
            mean = np.mean(w)
            std = np.std(w)
            min_val = np.min(w)
            max_val = np.max(w)
            
            print(f"\n   Layer {i} ({layer.name}):")
            print(f"      Shape: {w.shape}")
            print(f"      Mean: {mean:.6f}")
            print(f"      Std: {std:.6f}")
            print(f"      Range: [{min_val:.6f}, {max_val:.6f}]")
            
            # Check for signs of training
            if i == 0:  # First layer
                if abs(mean) < 0.001 and std < 0.01:
                    print(f"      ⚠️  WARNING: Weights look like random initialization!")
    
    # Overall statistics
    all_weights = np.array(all_weights)
    print(f"\n📈 Overall Weight Statistics:")
    print(f"   Total weights: {len(all_weights):,}")
    print(f"   Mean: {np.mean(all_weights):.6f}")
    print(f"   Std: {np.std(all_weights):.6f}")
    print(f"   Min: {np.min(all_weights):.6f}")
    print(f"   Max: {np.max(all_weights):.6f}")
    
    # Test with a simple prediction
    print(f"\n🧪 Testing Prediction:")
    test_images = [
        ('green', (0, 255, 0)),    # Green
        ('red', (255, 0, 0)),       # Red
        ('blue', (0, 0, 255)),      # Blue
        ('white', (255, 255, 255)), # White
    ]
    
    print(f"\n   Predictions for different colored test images:")
    predictions_list = []
    
    for color_name, color in test_images:
        # Create test image
        img = Image.new('RGB', (224, 224), color)
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        # Predict
        pred = model.predict(img_array, verbose=0)[0]
        predictions_list.append(pred)
        
        print(f"\n   {color_name.upper()} image:")
        print(f"      Probabilities: {pred}")
        print(f"      Std Dev: {np.std(pred):.4f}")
        print(f"      Max: {np.max(pred):.4f}")
    
    # Check if predictions are too uniform
    print(f"\n🎯 Model Training Assessment:")
    
    # Calculate average std dev across predictions
    avg_std = np.mean([np.std(p) for p in predictions_list])
    print(f"   Average prediction std dev: {avg_std:.4f}")
    
    # Check prediction differences
    pred_matrix = np.array(predictions_list)
    pred_variance = np.var(pred_matrix, axis=0)
    
    print(f"   Variance across different inputs: {pred_variance}")
    print(f"   Mean variance: {np.mean(pred_variance):.4f}")
    
    if avg_std < 0.05:
        print(f"\n❌ VERDICT: Model appears UNTRAINED!")
        print(f"   All predictions are nearly uniform (~25% each class)")
        print(f"   This indicates random/uninitialized weights")
        return False
    elif avg_std < 0.15:
        print(f"\n⚠️  VERDICT: Model might be undertrained or corrupted")
        print(f"   Predictions show low confidence/variance")
        return False
    else:
        print(f"\n✅ VERDICT: Model appears TRAINED")
        print(f"   Predictions show reasonable variance")
        print(f"   Weights appear to have been learned")
        return True

def compare_predictions(model_path, image_path):
    """Test model with a real image"""
    print(f"\n\n🖼️  Testing with Real Image: {image_path}")
    print("=" * 60)
    
    if not os.path.exists(image_path):
        print(f"⚠️  Image not found: {image_path}")
        return
    
    # Load model
    model = tf.keras.models.load_model(model_path, compile=False)
    
    # Load and preprocess image
    img = Image.open(image_path)
    img = img.resize((224, 224))
    img = img.convert('RGB')
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    
    # Predict
    pred = model.predict(img_array, verbose=0)[0]
    
    diseases = ['cordana', 'healthy', 'pestalotiopsis', 'sigatoka']
    
    print(f"\nPredictions:")
    for disease, prob in zip(diseases, pred):
        bar = "█" * int(prob * 50)
        print(f"  {disease:15s}: {prob:.4f} ({prob*100:.2f}%) {bar}")
    
    print(f"\nStatistics:")
    print(f"  Max probability: {np.max(pred):.4f} ({np.max(pred)*100:.2f}%)")
    print(f"  Std deviation: {np.std(pred):.4f}")
    print(f"  Entropy: {-np.sum(pred * np.log(pred + 1e-10)):.4f}")
    
    # Assess prediction quality
    if np.std(pred) < 0.05:
        print(f"\n❌ Prediction is nearly uniform - model is NOT working!")
    elif np.max(pred) < 0.5:
        print(f"\n⚠️  Low confidence prediction - model might need retraining")
    else:
        print(f"\n✅ Model shows confident prediction")

def main():
    """Main function"""
    print("🔬 Model Weight Verification Tool")
    print("=" * 60)
    print()
    
    # Check for model file
    if len(sys.argv) < 2:
        # Try default model name
        model_path = "banana_disease_classification_model1.keras"
        if not os.path.exists(model_path):
            print("Usage: python verify_model_weights.py <model_path> [image_path]")
            print("\nExample:")
            print("  python verify_model_weights.py banana_disease_classification_model1.keras")
            print("  python verify_model_weights.py model1.keras test_image.jpg")
            sys.exit(1)
    else:
        model_path = sys.argv[1]
    
    # Check model weights
    is_trained = check_model_weights(model_path)
    
    # If image provided, test with real image
    if len(sys.argv) >= 3:
        image_path = sys.argv[2]
        compare_predictions(model_path, image_path)
    
    # Final verdict
    print("\n" + "=" * 60)
    if is_trained:
        print("✅ FINAL VERDICT: Model appears properly trained")
        print("\n💡 If Render still gives wrong predictions:")
        print("   1. Check Render logs for model file size")
        print("   2. Verify the correct model file is being uploaded")
        print("   3. Try Git LFS to ensure file integrity")
    else:
        print("❌ FINAL VERDICT: Model is NOT properly trained!")
        print("\n🔧 Actions needed:")
        print("   1. Use Git LFS to upload the correct model file")
        print("   2. Or fix Google Drive download to get the correct file")
        print("   3. Ensure you're not using the fallback untrained model")

if __name__ == "__main__":
    main()
