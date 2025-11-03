"""
Script to convert the old Keras model to a new format compatible with Keras 3.x
Run this locally to create a new model file, then re-deploy.
"""
import tensorflow as tf
from tensorflow import keras
import os

# Old model path
OLD_MODEL_PATH = "banana_disease_classification_model1.keras"
NEW_MODEL_PATH = "banana_disease_model_v3.keras"

print("Loading old model...")
try:
    # Load with compile=False to avoid compilation issues
    model = keras.models.load_model(OLD_MODEL_PATH, compile=False)
    print("✅ Model loaded successfully!")
    
    # Recompile the model
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    print(f"Saving model in new format to {NEW_MODEL_PATH}...")
    model.save(NEW_MODEL_PATH, save_format='keras')
    
    print("✅ Model converted and saved successfully!")
    print(f"New model size: {os.path.getsize(NEW_MODEL_PATH) / (1024*1024):.2f} MB")
    
    # Test loading the new model
    print("\nTesting new model...")
    test_model = keras.models.load_model(NEW_MODEL_PATH, compile=False)
    print("✅ New model loads correctly!")
    print(f"Model summary:")
    test_model.summary()
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    
    print("\n🔧 Alternative approach: Load using weights...")
    try:
        # If JSON config exists, rebuild from architecture
        import json
        
        # Read the model architecture
        with open('banana_disease_classification_model.json', 'r') as f:
            model_json = f.read()
        
        # Load model from JSON
        from tensorflow.keras.models import model_from_json
        model = model_from_json(model_json)
        
        # Load weights
        model.load_weights('banana_disease_classification_weights.h5')
        
        print("✅ Model reconstructed from JSON + weights!")
        
        # Compile
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        # Save in new format
        model.save(NEW_MODEL_PATH, save_format='keras')
        print(f"✅ Saved to {NEW_MODEL_PATH}")
        
    except Exception as e2:
        print(f"❌ Alternative approach also failed: {e2}")
        import traceback
        traceback.print_exc()
