#!/usr/bin/env python3
"""
Quick test script to verify the model loads correctly
"""
import os
import sys

print("=" * 60)
print("BANANA DISEASE CLASSIFIER - MODEL LOAD TEST")
print("=" * 60)

# Test 1: Check current directory
print("\n1. Current Working Directory:")
cwd = os.getcwd()
print(f"   {cwd}")

# Test 2: Check for model files
print("\n2. Checking for model files:")
possible_paths = [
    os.path.join("saved_models", "banana_mobilenetv2_final.keras"),
    os.path.join("smart-banana", "saved_models", "banana_mobilenetv2_final.keras"),
    "banana_mobilenetv2_final.keras"
]

found_path = None
for path in possible_paths:
    exists = os.path.exists(path)
    status = "✅ FOUND" if exists else "❌ NOT FOUND"
    print(f"   {status}: {path}")
    if exists and found_path is None:
        found_path = path

if found_path is None:
    print("\n❌ ERROR: Model file not found in any expected location!")
    sys.exit(1)

print(f"\n✅ Will use: {found_path}")

# Test 3: Try loading TensorFlow
print("\n3. Loading TensorFlow...")
try:
    import tensorflow as tf
    print(f"   ✅ TensorFlow {tf.__version__} loaded")
except Exception as e:
    print(f"   ❌ Failed to load TensorFlow: {e}")
    sys.exit(1)

# Test 4: Try loading the model
print("\n4. Loading model...")
try:
    from tensorflow import keras
    model = keras.models.load_model(found_path, compile=False)
    print(f"   ✅ Model loaded successfully")
    print(f"   Model input shape: {model.input_shape}")
    print(f"   Model output shape: {model.output_shape}")
except Exception as e:
    print(f"   ❌ Failed to load model: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 5: Try loading the classifier
print("\n5. Loading BananaLeafClassifier...")
try:
    from enhanced_inference import BananaLeafClassifier
    classifier = BananaLeafClassifier(found_path)
    print(f"   ✅ Classifier loaded successfully")
    print(f"   Diseases: {classifier.diseases}")
except Exception as e:
    print(f"   ❌ Failed to load classifier: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 6: Try starting Flask app (import only)
print("\n6. Checking Flask server...")
try:
    import server
    print(f"   ✅ Server module imported")
    print(f"   Model loaded in server: {server.classifier is not None}")
except Exception as e:
    print(f"   ❌ Failed to import server: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "=" * 60)
print("✅ ALL TESTS PASSED - Ready for deployment!")
print("=" * 60)
print("\nNext steps:")
print("1. git add .")
print("2. git commit -m 'Fix model loading for Render'")
print("3. git push")
print("4. Check Render logs after deployment")
print("5. Test with: https://smart-banana.onrender.com/health")
