"""
Upload your trained model to Google Drive and get a direct download link
"""

# STEP 1: Upload your model to Google Drive
# ==========================================
# 1. Go to https://drive.google.com
# 2. Upload banana_disease_classification_model1.keras (128 MB file)
# 3. Right-click the file → Share → Get Link
# 4. Make sure it's set to "Anyone with the link can view"
# 5. Copy the file ID from the URL
#
# Example URL: https://drive.google.com/file/d/YOUR_FILE_ID_HERE/view
# You need: YOUR_FILE_ID_HERE


# STEP 2: Update server.py with your file ID
# ==========================================
# In server.py, line ~23, replace:
# "url": "https://drive.google.com/uc?export=download&id=1RdifNpsZYjiU7dKFVXH3zCyrpp9jPcg7",
# With your actual file ID:
# "url": "https://drive.google.com/uc?export=download&id=YOUR_FILE_ID_HERE",


# STEP 3: Test the download locally
# ==========================================
import requests
import os

def test_model_download(file_id):
    """Test if you can download the model from Google Drive"""
    url = f"https://drive.google.com/uc?export=download&id={file_id}"
    print(f"Testing download from: {url}")
    
    try:
        response = requests.get(url, stream=True, timeout=30)
        
        if response.status_code == 200:
            # Check file size
            content_length = response.headers.get('content-length')
            if content_length:
                size_mb = int(content_length) / (1024 * 1024)
                print(f"✅ Download successful! File size: {size_mb:.2f} MB")
                
                # Check if it's actually the model (should be ~128 MB)
                if 100 < size_mb < 150:
                    print("✅ File size looks correct for the model!")
                    return True
                else:
                    print(f"⚠️ File size {size_mb:.2f} MB seems wrong (expected ~128 MB)")
                    print("Make sure you're linking to the correct file!")
                    return False
            else:
                print("⚠️ Could not determine file size")
                return False
        else:
            print(f"❌ Download failed with status code: {response.status_code}")
            print("Make sure:")
            print("  1. The file is shared with 'Anyone with the link'")
            print("  2. The file ID is correct")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


if __name__ == "__main__":
    print("="*70)
    print("MODEL UPLOAD TO GOOGLE DRIVE - HELPER SCRIPT")
    print("="*70)
    
    print("\n📋 INSTRUCTIONS:")
    print("1. Upload banana_disease_classification_model1.keras to Google Drive")
    print("2. Share it (Anyone with the link can view)")
    print("3. Copy the file ID from the URL")
    print("4. Test the download with this script")
    
    print("\n" + "-"*70)
    file_id = input("\nEnter your Google Drive file ID: ").strip()
    
    if not file_id:
        print("No file ID provided. Exiting.")
        exit()
    
    if test_model_download(file_id):
        print("\n" + "="*70)
        print("✅ SUCCESS! Your model can be downloaded from Google Drive")
        print("="*70)
        print("\n📝 NEXT STEP: Update server.py")
        print(f"Replace the file ID in MODEL_FILES['keras']['url'] with:")
        print(f"  {file_id}")
        print("\nThen deploy your code!")
    else:
        print("\n" + "="*70)
        print("❌ FAILED! Fix the issues above and try again")
        print("="*70)
