"""
Upload model to Hugging Face Hub
This is an alternative to Git LFS, specifically designed for ML models
"""

import os
from huggingface_hub import HfApi, login, hf_hub_download
from pathlib import Path

def upload_to_huggingface():
    """
    Upload model to Hugging Face Hub
    """
    print("="*60)
    print("🤗 Uploading to Hugging Face Hub")
    print("="*60)
    
    # Model details
    model_file = "banana_disease_classification_model1.keras"
    repo_name = "banana-disease-classifier"  # Change this to your preferred name
    
    # Check if model exists
    if not os.path.exists(model_file):
        print(f"❌ Model file not found: {model_file}")
        return False
    
    model_size = os.path.getsize(model_file) / (1024 * 1024)
    print(f"📦 Model file: {model_file}")
    print(f"   Size: {model_size:.2f} MB\n")
    
    # Login to Hugging Face
    print("🔐 Login to Hugging Face")
    print("   You'll need to create an account at: https://huggingface.co/join")
    print("   Then create a token at: https://huggingface.co/settings/tokens")
    print()
    
    try:
        login()
        print("✅ Logged in successfully!\n")
    except Exception as e:
        print(f"❌ Login failed: {e}")
        print("\nTo login manually:")
        print("1. Get your token from: https://huggingface.co/settings/tokens")
        print("2. Run: huggingface-cli login")
        print("3. Paste your token")
        return False
    
    # Get username
    try:
        api = HfApi()
        user_info = api.whoami()
        username = user_info['name']
        print(f"👤 Username: {username}\n")
    except Exception as e:
        print(f"❌ Could not get username: {e}")
        username = input("Please enter your Hugging Face username: ")
    
    repo_id = f"{username}/{repo_name}"
    
    # Create repository
    print(f"📁 Creating repository: {repo_id}")
    try:
        api.create_repo(
            repo_id=repo_id,
            repo_type="model",
            exist_ok=True,
            private=False  # Set to True if you want private
        )
        print("✅ Repository created/exists\n")
    except Exception as e:
        print(f"⚠️ Repository may already exist: {e}\n")
    
    # Upload model
    print("📤 Uploading model file...")
    try:
        api.upload_file(
            path_or_fileobj=model_file,
            path_in_repo=model_file,
            repo_id=repo_id,
            repo_type="model",
        )
        print("✅ Model uploaded successfully!\n")
    except Exception as e:
        print(f"❌ Upload failed: {e}")
        return False
    
    # Create README
    readme_content = f"""---
license: apache-2.0
tags:
- image-classification
- banana-disease
- agriculture
- plant-disease
datasets: []
---

# Banana Disease Classification Model

This model classifies banana leaf diseases into 4 categories:
- Cordana
- Healthy
- Pestalotiopsis
- Sigatoka

## Model Details
- **Model Type**: Convolutional Neural Network (CNN)
- **Input Size**: 224x224 RGB images
- **Framework**: TensorFlow/Keras
- **File Size**: {model_size:.2f} MB

## Usage

```python
from tensorflow import keras
from huggingface_hub import hf_hub_download
from PIL import Image
import numpy as np

# Download model
model_path = hf_hub_download(
    repo_id="{repo_id}",
    filename="{model_file}"
)

# Load model
model = keras.models.load_model(model_path)

# Predict
image = Image.open("banana_leaf.jpg").resize((224, 224))
image_array = np.array(image) / 255.0
image_array = np.expand_dims(image_array, axis=0)

predictions = model.predict(image_array)
classes = ['cordana', 'healthy', 'pestalotiopsis', 'sigatoka']
predicted_class = classes[np.argmax(predictions)]

print(f"Predicted: {{predicted_class}}")
```

## Training Details
- Trained on banana leaf disease dataset
- Image preprocessing: Resize to 224x224, normalize to [0,1]
- Classes: {{'cordana', 'healthy', 'pestalotiopsis', 'sigatoka'}}

## License
Apache 2.0
"""
    
    # Upload README
    print("📝 Creating README...")
    try:
        api.upload_file(
            path_or_fileobj=readme_content.encode(),
            path_in_repo="README.md",
            repo_id=repo_id,
            repo_type="model",
        )
        print("✅ README uploaded\n")
    except Exception as e:
        print(f"⚠️ Could not upload README: {e}\n")
    
    # Print success message
    print("="*60)
    print("✅ UPLOAD COMPLETE!")
    print("="*60)
    print(f"\n🔗 Model URL: https://huggingface.co/{repo_id}")
    print(f"\n📥 To download in your code:")
    print(f"""
from huggingface_hub import hf_hub_download

model_path = hf_hub_download(
    repo_id="{repo_id}",
    filename="{model_file}"
)
""")
    
    print("\n📋 Update your server.py with:")
    print(f"""
from huggingface_hub import hf_hub_download

def download_model():
    if not os.path.exists(MODEL_PATH):
        print("📥 Downloading from Hugging Face...")
        downloaded_path = hf_hub_download(
            repo_id="{repo_id}",
            filename="{model_file}",
            local_dir=BASE_DIR,
            local_dir_use_symlinks=False
        )
        # Move to expected location
        import shutil
        shutil.move(downloaded_path, MODEL_PATH)
    return True
""")
    
    return True


def download_from_huggingface(repo_id, filename, local_dir="."):
    """
    Download model from Hugging Face
    """
    print(f"📥 Downloading {filename} from {repo_id}...")
    
    try:
        path = hf_hub_download(
            repo_id=repo_id,
            filename=filename,
            local_dir=local_dir,
            local_dir_use_symlinks=False
        )
        print(f"✅ Downloaded to: {path}")
        return path
    except Exception as e:
        print(f"❌ Download failed: {e}")
        return None


def main():
    import sys
    
    print("\n🍌 Banana Disease Model - Hugging Face Upload\n")
    
    if len(sys.argv) > 1 and sys.argv[1] == "download":
        # Download mode
        if len(sys.argv) < 3:
            print("Usage: python upload_to_huggingface.py download <repo_id>")
            print("Example: python upload_to_huggingface.py download username/banana-disease-classifier")
            return
        
        repo_id = sys.argv[2]
        filename = "banana_disease_classification_model1.keras"
        download_from_huggingface(repo_id, filename)
    else:
        # Upload mode
        print("📤 This will upload your model to Hugging Face Hub")
        print("   (You'll need a Hugging Face account)")
        print()
        
        response = input("Continue? (y/n): ")
        if response.lower() != 'y':
            print("Cancelled.")
            return
        
        upload_to_huggingface()


if __name__ == "__main__":
    # Check if huggingface_hub is installed
    try:
        import huggingface_hub
    except ImportError:
        print("❌ huggingface_hub not installed")
        print("   Run: pip install huggingface_hub")
        exit(1)
    
    main()
