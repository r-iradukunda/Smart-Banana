"""
Quick Fix Script for Model Hosting Issue
Run this to set up Git LFS for your 127MB model file
"""

import subprocess
import os
import sys

def run_command(cmd, description):
    """Run a command and print the result"""
    print(f"\n{'='*60}")
    print(f"🔧 {description}")
    print(f"{'='*60}")
    print(f"Command: {cmd}")
    
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        print(result.stdout)
        if result.stderr:
            print("Errors/Warnings:", result.stderr)
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def check_git_lfs():
    """Check if Git LFS is installed"""
    result = subprocess.run("git lfs version", shell=True, capture_output=True)
    return result.returncode == 0

def setup_git_lfs():
    """Set up Git LFS for the model file"""
    
    print("="*60)
    print("🚀 Git LFS Setup for Banana Disease Model")
    print("="*60)
    
    # Check if Git LFS is installed
    if not check_git_lfs():
        print("\n❌ Git LFS is not installed!")
        print("\n📥 Please install Git LFS first:")
        print("   Windows: Download from https://git-lfs.github.com/")
        print("   Or use: choco install git-lfs")
        print("   Or use: scoop install git-lfs")
        print("\n   Then run this script again.")
        return False
    
    print("\n✅ Git LFS is installed!")
    
    # Initialize Git LFS
    if not run_command("git lfs install", "Initializing Git LFS"):
        print("⚠️ Git LFS may already be initialized (this is OK)")
    
    # Track .keras files
    if not run_command('git lfs track "*.keras"', "Setting up tracking for .keras files"):
        print("❌ Failed to set up tracking")
        return False
    
    print("\n✅ Git LFS is configured!")
    
    # Check if .gitattributes exists
    if os.path.exists(".gitattributes"):
        print("\n✅ .gitattributes file created")
        with open(".gitattributes", "r") as f:
            print("Contents:")
            print(f.read())
    
    # Check model file size
    model_file = "banana_disease_classification_model1.keras"
    if os.path.exists(model_file):
        size = os.path.getsize(model_file)
        size_mb = size / (1024 * 1024)
        print(f"\n📦 Model file: {model_file}")
        print(f"   Size: {size_mb:.2f} MB")
        
        if size_mb < 100:
            print("   ⚠️ WARNING: File seems small, expected ~127MB")
    else:
        print(f"\n❌ Model file not found: {model_file}")
        return False
    
    print("\n" + "="*60)
    print("📋 NEXT STEPS:")
    print("="*60)
    print("1. Add .gitattributes to git:")
    print("   git add .gitattributes")
    print()
    print("2. Add the model file:")
    print(f"   git add {model_file}")
    print()
    print("3. Commit the changes:")
    print('   git commit -m "Add model with Git LFS"')
    print()
    print("4. Push to GitHub:")
    print("   git push origin main")
    print()
    print("5. Verify on GitHub:")
    print("   - Check if model shows 'Stored with Git LFS'")
    print("   - File size should be ~127MB")
    print()
    print("6. Redeploy your app on Render/Heroku")
    print("="*60)
    
    return True

def test_model_file():
    """Test if the model file is valid"""
    print("\n" + "="*60)
    print("🧪 Testing Model File")
    print("="*60)
    
    model_file = "banana_disease_classification_model1.keras"
    
    if not os.path.exists(model_file):
        print(f"❌ Model file not found: {model_file}")
        return False
    
    try:
        from tensorflow import keras
        print("📦 Loading model...")
        model = keras.models.load_model(model_file, compile=False)
        print(f"✅ Model loaded successfully!")
        print(f"   Layers: {len(model.layers)}")
        print(f"   Input shape: {model.input_shape}")
        print(f"   Output shape: {model.output_shape}")
        return True
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        return False

if __name__ == "__main__":
    print("\n🍌 Banana Disease Model - Git LFS Setup\n")
    
    # Change to script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    print(f"Working directory: {script_dir}\n")
    
    # Set up Git LFS
    if setup_git_lfs():
        print("\n✅ Git LFS setup complete!")
        
        # Test model
        test_model_file()
    else:
        print("\n❌ Setup failed. Please check the errors above.")
        sys.exit(1)
