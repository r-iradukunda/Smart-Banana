"""
🚀 ONE-CLICK FIX for Model Hosting Issue
Run this script to diagnose and fix your model hosting problem
"""

import os
import sys
import subprocess
import hashlib
from pathlib import Path

class Colors:
    """ANSI color codes"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.HEADER}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.HEADER}{text}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.HEADER}{'='*60}{Colors.ENDC}\n")

def print_success(text):
    print(f"{Colors.OKGREEN}✅ {text}{Colors.ENDC}")

def print_error(text):
    print(f"{Colors.FAIL}❌ {text}{Colors.ENDC}")

def print_warning(text):
    print(f"{Colors.WARNING}⚠️  {text}{Colors.ENDC}")

def print_info(text):
    print(f"{Colors.OKCYAN}ℹ️  {text}{Colors.ENDC}")

def check_file_exists(filepath, description):
    """Check if a file exists"""
    if os.path.exists(filepath):
        size = os.path.getsize(filepath)
        size_mb = size / (1024 * 1024)
        print_success(f"{description} exists ({size_mb:.2f} MB)")
        return True
    else:
        print_error(f"{description} not found: {filepath}")
        return False

def get_file_hash(filepath):
    """Calculate MD5 hash of a file"""
    hasher = hashlib.md5()
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hasher.update(chunk)
    return hasher.hexdigest()

def test_model_loading():
    """Test if the model can be loaded"""
    print_header("Testing Model Loading")
    
    model_file = "banana_disease_classification_model1.keras"
    
    if not check_file_exists(model_file, "Model file"):
        return False
    
    try:
        from tensorflow import keras
        print_info("Loading model with TensorFlow/Keras...")
        model = keras.models.load_model(model_file, compile=False)
        print_success(f"Model loaded successfully!")
        print_info(f"  - Layers: {len(model.layers)}")
        print_info(f"  - Input shape: {model.input_shape}")
        print_info(f"  - Output shape: {model.output_shape}")
        print_info(f"  - Parameters: {model.count_params():,}")
        return True
    except Exception as e:
        print_error(f"Failed to load model: {e}")
        return False

def test_model_predictions():
    """Test if model gives reasonable predictions"""
    print_header("Testing Model Predictions")
    
    try:
        from enhanced_inference import BananaLeafClassifier
        import numpy as np
        
        classifier = BananaLeafClassifier("banana_disease_classification_model1.keras")
        
        # Test with random noise
        print_info("Testing with random noise...")
        random_image = np.random.rand(1, 224, 224, 3).astype(np.float32)
        predictions = classifier.model.predict(random_image, verbose=0)[0]
        
        print_info("Predictions:")
        for disease, prob in zip(classifier.diseases, predictions):
            print(f"  - {disease}: {prob:.4f}")
        
        std_dev = np.std(predictions)
        print_info(f"Standard deviation: {std_dev:.4f}")
        
        if std_dev < 0.1:
            print_error("Model appears UNTRAINED! Predictions are too uniform.")
            print_error("All predictions are ~0.25 (random guessing)")
            return False
        else:
            print_success("Model appears trained! Predictions vary significantly.")
            return True
            
    except Exception as e:
        print_error(f"Failed to test predictions: {e}")
        return False

def check_git_lfs():
    """Check if Git LFS is installed"""
    print_header("Checking Git LFS")
    
    try:
        result = subprocess.run(
            "git lfs version",
            shell=True,
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            print_success(f"Git LFS is installed: {result.stdout.strip()}")
            return True
        else:
            print_error("Git LFS is not installed")
            return False
    except:
        print_error("Git LFS is not installed")
        return False

def check_huggingface():
    """Check if huggingface_hub is installed"""
    print_header("Checking Hugging Face Hub")
    
    try:
        import huggingface_hub
        print_success(f"huggingface_hub is installed: v{huggingface_hub.__version__}")
        return True
    except ImportError:
        print_warning("huggingface_hub is not installed")
        print_info("Install with: pip install huggingface-hub")
        return False

def suggest_solution():
    """Suggest best solution based on environment"""
    print_header("Recommended Solution")
    
    has_git_lfs = check_git_lfs()
    has_hf = check_huggingface()
    
    print("\n" + "="*60)
    
    if has_git_lfs:
        print_success("Option A: Git LFS (RECOMMENDED)")
        print("  You have Git LFS installed!")
        print("\n  Quick setup:")
        print("  1. Run: python setup_git_lfs_quick.py")
        print("  2. Follow the instructions")
        print("  3. Push to GitHub")
        print("  4. Redeploy your app")
    
    print("\n" + "-"*60 + "\n")
    
    if has_hf:
        print_success("Option B: Hugging Face Hub (ALTERNATIVE)")
        print("  You have huggingface_hub installed!")
        print("\n  Quick setup:")
        print("  1. Run: python upload_to_huggingface.py")
        print("  2. Create/login to HF account")
        print("  3. Update server.py (see URGENT_FIX_GUIDE.md)")
        print("  4. Redeploy your app")
    else:
        print_warning("Option B: Hugging Face Hub")
        print("  Install with: pip install huggingface-hub")
        print("  Then run: python upload_to_huggingface.py")
    
    print("\n" + "-"*60 + "\n")
    
    print_info("Option C: Manual Upload")
    print("  1. Upload model to cloud storage (Cloudinary, AWS S3, etc.)")
    print("  2. Update download URL in server.py")
    print("  3. Test download with: python test_download.py")
    
    print("\n" + "="*60 + "\n")

def create_hash_reference():
    """Create a hash reference file for verification"""
    print_header("Creating Hash Reference")
    
    model_file = "banana_disease_classification_model1.keras"
    
    if not os.path.exists(model_file):
        print_error(f"Model file not found: {model_file}")
        return
    
    try:
        file_hash = get_file_hash(model_file)
        file_size = os.path.getsize(model_file)
        
        with open("MODEL_HASH.txt", "w") as f:
            f.write(f"Model File Hash Reference\n")
            f.write(f"{'='*40}\n\n")
            f.write(f"File: {model_file}\n")
            f.write(f"Size: {file_size:,} bytes ({file_size/(1024*1024):.2f} MB)\n")
            f.write(f"MD5 Hash: {file_hash}\n")
            f.write(f"\nUse this hash to verify the model file on your hosted server.\n")
            f.write(f"If hashes don't match, the file is corrupted or different.\n")
        
        print_success("Hash reference saved to MODEL_HASH.txt")
        print_info(f"  MD5: {file_hash}")
        print_info(f"  Size: {file_size/(1024*1024):.2f} MB")
        
    except Exception as e:
        print_error(f"Failed to create hash reference: {e}")

def main():
    """Main function"""
    print(f"\n{Colors.BOLD}🍌 Banana Disease Model - Diagnostic & Fix Tool{Colors.ENDC}")
    print(f"{Colors.BOLD}{'='*60}{Colors.ENDC}\n")
    
    # Change to script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    print_info(f"Working directory: {script_dir}\n")
    
    # Run diagnostics
    model_exists = check_file_exists(
        "banana_disease_classification_model1.keras",
        "Model file"
    )
    
    if not model_exists:
        print_error("\nModel file not found! Cannot continue.")
        print_info("Make sure you're in the correct directory.")
        sys.exit(1)
    
    print()
    
    # Test loading
    can_load = test_model_loading()
    
    if not can_load:
        print_error("\nModel cannot be loaded! Fix this first.")
        sys.exit(1)
    
    print()
    
    # Test predictions
    is_trained = test_model_predictions()
    
    if not is_trained:
        print_error("\nModel is UNTRAINED! This explains the 25% confidence issue.")
        print_info("The hosted server is using a model with random weights.")
        print()
    
    # Create hash reference
    create_hash_reference()
    
    # Suggest solution
    suggest_solution()
    
    # Print next steps
    print_header("Next Steps")
    print("1. Choose a solution (A, B, or C)")
    print("2. Follow the setup instructions")
    print("3. Add debug endpoints from debug_endpoints.py")
    print("4. Test with: /debug/test-random-prediction")
    print("5. Verify std_dev > 0.1 (trained model)")
    print("\nSee URGENT_FIX_GUIDE.md for detailed instructions")
    print()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.WARNING}Cancelled by user{Colors.ENDC}")
        sys.exit(0)
    except Exception as e:
        print_error(f"\nUnexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
