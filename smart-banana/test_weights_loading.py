"""
Test script to verify weights loading and determine correct architecture
"""
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout
from tensorflow.keras import Sequential
import os

def test_weights_architecture():
    """Test different architectures with the weights file"""
    
    weights_path = "saved_models/best_mobilenetv2_weights.h5"
    
    if not os.path.exists(weights_path):
        weights_path = "best_mobilenetv2_weights.h5"
    
    if not os.path.exists(weights_path):
        print(f"❌ Weights file not found!")
        return None
    
    print(f"✅ Found weights file: {weights_path}")
    print()
    
    # Try different architecture configurations
    architectures = [
        # Config 1: Basic MobileNetV2 + GAP + Dense
        {
            "name": "Basic (GAP + Dense)",
            "model": lambda: Sequential([
                MobileNetV2(input_shape=(160, 160, 3), include_top=False, weights=None),
                GlobalAveragePooling2D(),
                Dense(4, activation='softmax')
            ])
        },
        # Config 2: With Dropout
        {
            "name": "With Dropout (GAP + Dropout + Dense)",
            "model": lambda: Sequential([
                MobileNetV2(input_shape=(160, 160, 3), include_top=False, weights=None),
                GlobalAveragePooling2D(),
                Dropout(0.2),
                Dense(4, activation='softmax')
            ])
        },
        # Config 3: With higher dropout
        {
            "name": "With Higher Dropout (GAP + Dropout(0.5) + Dense)",
            "model": lambda: Sequential([
                MobileNetV2(input_shape=(160, 160, 3), include_top=False, weights=None),
                GlobalAveragePooling2D(),
                Dropout(0.5),
                Dense(4, activation='softmax')
            ])
        },
        # Config 4: Frozen base model
        {
            "name": "Frozen Base (trainable=False)",
            "model": lambda: Sequential([
                MobileNetV2(input_shape=(160, 160, 3), include_top=False, weights=None, trainable=False),
                GlobalAveragePooling2D(),
                Dense(4, activation='softmax')
            ])
        }
    ]
    
    successful_config = None
    
    for i, config in enumerate(architectures, 1):
        print(f"{'='*60}")
        print(f"Testing Configuration {i}: {config['name']}")
        print(f"{'='*60}")
        
        try:
            # Create model
            model = config['model']()
            
            print(f"📊 Model architecture:")
            print(f"   Layers: {len(model.layers)}")
            print(f"   Input shape: {model.input_shape}")
            print(f"   Output shape: {model.output_shape}")
            
            # Try to load weights
            print(f"🔄 Loading weights...")
            model.load_weights(weights_path)
            
            print(f"✅ SUCCESS! Weights loaded successfully!")
            print(f"   Total params: {model.count_params():,}")
            
            # Test with dummy data
            import numpy as np
            dummy_input = np.random.rand(1, 160, 160, 3)
            prediction = model.predict(dummy_input, verbose=0)
            
            print(f"✅ Prediction test passed!")
            print(f"   Output shape: {prediction.shape}")
            print(f"   Sum of probabilities: {prediction.sum():.4f}")
            
            successful_config = config
            print(f"\n🎉 This configuration works!\n")
            break
            
        except Exception as e:
            print(f"❌ Failed: {str(e)[:100]}")
            print()
            continue
    
    if successful_config:
        print(f"\n{'='*60}")
        print(f"✅ SOLUTION FOUND!")
        print(f"{'='*60}")
        print(f"Working configuration: {successful_config['name']}")
        print(f"\nUse this architecture in your code.")
        return successful_config
    else:
        print(f"\n{'='*60}")
        print(f"❌ NO WORKING CONFIGURATION FOUND")
        print(f"{'='*60}")
        print("The weights file might be incompatible or corrupted.")
        print("Try converting the original .keras model instead.")
        return None

def inspect_weights_file():
    """Inspect the weights file to understand its structure"""
    import h5py
    
    weights_path = "saved_models/best_mobilenetv2_weights.h5"
    if not os.path.exists(weights_path):
        weights_path = "best_mobilenetv2_weights.h5"
    
    if not os.path.exists(weights_path):
        print("❌ Weights file not found!")
        return
    
    print(f"\n{'='*60}")
    print(f"Inspecting Weights File Structure")
    print(f"{'='*60}\n")
    
    try:
        with h5py.File(weights_path, 'r') as f:
            def print_structure(name, obj):
                if isinstance(obj, h5py.Dataset):
                    print(f"  📊 {name}: {obj.shape}")
                elif isinstance(obj, h5py.Group):
                    print(f"  📁 {name}/")
            
            print("File contents:")
            f.visititems(print_structure)
            
            # Count layers
            if 'model_weights' in f:
                layers = list(f['model_weights'].keys())
                print(f"\n✅ Found {len(layers)} layers in model_weights")
                print(f"   First 5 layers: {layers[:5]}")
                print(f"   Last 5 layers: {layers[-5:]}")
            
    except Exception as e:
        print(f"❌ Error inspecting file: {e}")

if __name__ == "__main__":
    print("="*60)
    print("Weights File Testing Script")
    print("="*60)
    print()
    
    # First inspect the file
    inspect_weights_file()
    print()
    
    # Then test architectures
    result = test_weights_architecture()
    
    if result:
        print(f"\n{'='*60}")
        print(f"Next Steps:")
        print(f"{'='*60}")
        print(f"1. Update enhanced_inference.py with the working architecture")
        print(f"2. Test locally with: python server.py")
        print(f"3. Deploy to Render")
    else:
        print(f"\n{'='*60}")
        print(f"Recommended Action:")
        print(f"{'='*60}")
        print(f"Convert the original .keras model to .h5 format instead:")
        print(f"  python model_converter.py")
