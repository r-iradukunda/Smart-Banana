"""
Model Converter Script
Converts the Keras 3 model to a more compatible format for deployment
"""
import tensorflow as tf
from tensorflow import keras
import os

def convert_model_to_h5():
    """Convert the .keras model to .h5 format for better compatibility"""
    try:
        print("🔄 Loading original model...")
        model_path = "banana_mobilenetv2_final.keras"
        
        # Load the model
        model = keras.models.load_model(model_path, compile=False)
        print(f"✅ Model loaded successfully")
        print(f"   Input shape: {model.input_shape}")
        print(f"   Output shape: {model.output_shape}")
        
        # Save in H5 format
        h5_path = "saved_models/banana_mobilenetv2_final.h5"
        os.makedirs("saved_models", exist_ok=True)
        
        print(f"💾 Saving model to {h5_path}...")
        model.save(h5_path, save_format='h5')
        print(f"✅ Model saved successfully in H5 format")
        
        # Verify the saved model
        print("🔍 Verifying saved model...")
        test_model = keras.models.load_model(h5_path, compile=False)
        print(f"✅ Verification successful")
        print(f"   Input shape: {test_model.input_shape}")
        print(f"   Output shape: {test_model.output_shape}")
        
        return True
        
    except Exception as e:
        print(f"❌ Conversion failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def convert_model_to_savedmodel():
    """Convert to TensorFlow SavedModel format (directory-based)"""
    try:
        print("🔄 Loading original model...")
        model_path = "banana_mobilenetv2_final.keras"
        
        # Load the model
        model = keras.models.load_model(model_path, compile=False)
        print(f"✅ Model loaded successfully")
        
        # Save as SavedModel
        savedmodel_path = "saved_models/banana_model_savedmodel"
        print(f"💾 Saving model to {savedmodel_path}...")
        model.save(savedmodel_path, save_format='tf')
        print(f"✅ Model saved successfully in SavedModel format")
        
        return True
        
    except Exception as e:
        print(f"❌ Conversion failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Model Converter for Deployment Compatibility")
    print("=" * 60)
    print()
    
    print("Option 1: Converting to H5 format...")
    print("-" * 60)
    h5_success = convert_model_to_h5()
    print()
    
    print("Option 2: Converting to SavedModel format...")
    print("-" * 60)
    savedmodel_success = convert_model_to_savedmodel()
    print()
    
    print("=" * 60)
    print("Summary:")
    print(f"  H5 format: {'✅ Success' if h5_success else '❌ Failed'}")
    print(f"  SavedModel format: {'✅ Success' if savedmodel_success else '❌ Failed'}")
    print("=" * 60)
    
    if h5_success:
        print("\n✅ Recommended: Use the H5 model for deployment")
        print("   File: saved_models/banana_mobilenetv2_final.h5")
