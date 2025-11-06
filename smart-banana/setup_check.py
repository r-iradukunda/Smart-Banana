#!/usr/bin/env python3
"""
Script to download the model file if it doesn't exist locally.
This is useful for deployment platforms where Git LFS might not work properly.
"""

import os
import sys

def download_model():
    """Download model if not present"""
    model_path = 'saved_models/banana_mobilenetv2_final.keras'
    
    # Check if model already exists
    if os.path.exists(model_path):
        print(f"✓ Model already exists at {model_path}")
        file_size = os.path.getsize(model_path)
        print(f"  File size: {file_size / (1024*1024):.2f} MB")
        
        # Check if it's a Git LFS pointer file (very small)
        if file_size < 1000:
            print("⚠ Warning: Model file seems to be a Git LFS pointer file")
            print("  You need to:")
            print("  1. Install Git LFS: git lfs install")
            print("  2. Pull the actual file: git lfs pull")
            return False
        return True
    
    # Create directory if it doesn't exist
    os.makedirs('saved_models', exist_ok=True)
    
    print("Model file not found. You have two options:")
    print()
    print("Option 1: Use Git LFS (recommended if model is in Git)")
    print("  git lfs install")
    print("  git lfs pull")
    print()
    print("Option 2: Download manually from your storage")
    print("  Place the model file at: saved_models/banana_mobilenetv2_final.keras")
    print()
    print("Option 3: Use Google Drive (if you have a shareable link)")
    print("  You can use gdown to download from Google Drive")
    print()
    
    return False

def check_dependencies():
    """Check if required packages are installed"""
    required_packages = [
        'tensorflow',
        'flask',
        'flask_cors',
        'pillow',
        'opencv-python',
        'numpy'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✓ {package} is installed")
        except ImportError:
            missing_packages.append(package)
            print(f"✗ {package} is NOT installed")
    
    if missing_packages:
        print("\nMissing packages detected!")
        print("Install them with:")
        print(f"pip install {' '.join(missing_packages)}")
        return False
    
    print("\n✓ All required packages are installed")
    return True

def main():
    print("=" * 60)
    print("Banana Disease Classification - Setup Check")
    print("=" * 60)
    print()
    
    print("Checking dependencies...")
    deps_ok = check_dependencies()
    print()
    
    print("Checking model file...")
    model_ok = download_model()
    print()
    
    if deps_ok and model_ok:
        print("✓ Setup complete! You can now run the server:")
        print("  python server_fixed.py")
        print("  or")
        print("  gunicorn server_fixed:app")
        return 0
    else:
        print("⚠ Setup incomplete. Please address the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
