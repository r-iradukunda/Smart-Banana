"""
Test script to compare local file upload vs URL-based prediction
"""
import requests
import json
from pathlib import Path

# Configuration
API_URL = "http://localhost:5000"  # Change to your deployed URL when testing production
TEST_IMAGE_PATH = "0.jpeg"  # Change to your test image path
TEST_IMAGE_URL = "https://your-hosted-image-url.com/image.jpg"  # Add your hosted image URL

def test_file_upload(image_path):
    """Test prediction with file upload"""
    print("\n" + "="*60)
    print("Testing FILE UPLOAD endpoint")
    print("="*60)
    
    try:
        with open(image_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(f"{API_URL}/predict", files=files)
        
        print(f"Status Code: {response.status_code}")
        result = response.json()
        print("\nResponse:")
        print(json.dumps(result, indent=2))
        
        return result
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_url_prediction(image_url):
    """Test prediction with image URL"""
    print("\n" + "="*60)
    print("Testing URL PREDICTION endpoint")
    print("="*60)
    
    try:
        payload = {"url": image_url}
        headers = {'Content-Type': 'application/json'}
        response = requests.post(f"{API_URL}/predict-url", json=payload, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        result = response.json()
        print("\nResponse:")
        print(json.dumps(result, indent=2))
        
        return result
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def compare_results(file_result, url_result):
    """Compare results from both methods"""
    print("\n" + "="*60)
    print("COMPARISON")
    print("="*60)
    
    if not file_result or not url_result:
        print("❌ Cannot compare - one or both predictions failed")
        return
    
    print("\n📊 File Upload Results:")
    if file_result.get("is_rejected"):
        print(f"  Status: REJECTED")
        print(f"  Reasons: {file_result.get('rejection_reasons', [])}")
    else:
        print(f"  Status: ACCEPTED")
        print(f"  Disease: {file_result.get('predicted_disease')}")
        print(f"  Confidence: {file_result.get('confidence')}")
        print(f"  Entropy: {file_result.get('entropy', 'N/A'):.4f}")
    
    print("\n📊 URL Prediction Results:")
    if url_result.get("is_rejected"):
        print(f"  Status: REJECTED")
        print(f"  Reasons: {url_result.get('rejection_reasons', [])}")
    else:
        print(f"  Status: ACCEPTED")
        print(f"  Disease: {url_result.get('predicted_disease')}")
        print(f"  Confidence: {url_result.get('confidence')}")
        print(f"  Entropy: {url_result.get('entropy', 'N/A'):.4f}")
    
    # Check if results match
    print("\n🔍 Match Analysis:")
    
    rejection_match = file_result.get("is_rejected") == url_result.get("is_rejected")
    print(f"  Rejection status matches: {'✅' if rejection_match else '❌'}")
    
    if not file_result.get("is_rejected") and not url_result.get("is_rejected"):
        disease_match = file_result.get("predicted_disease") == url_result.get("predicted_disease")
        print(f"  Predicted disease matches: {'✅' if disease_match else '❌'}")
        
        # Compare confidence scores
        try:
            file_conf = float(file_result.get("confidence_score", 0))
            url_conf = float(url_result.get("confidence_score", 0))
            conf_diff = abs(file_conf - url_conf)
            print(f"  Confidence difference: {conf_diff:.4f}")
            
            if conf_diff < 0.01:
                print(f"  Confidence similarity: ✅ Very similar")
            elif conf_diff < 0.1:
                print(f"  Confidence similarity: ⚠️ Slightly different")
            else:
                print(f"  Confidence similarity: ❌ Significantly different")
        except:
            print(f"  Confidence comparison: ⚠️ Could not compare")
    
    # Compare probabilities if both accepted
    if not file_result.get("is_rejected") and not url_result.get("is_rejected"):
        print("\n📈 Probability Comparison:")
        file_probs = file_result.get("raw_probabilities", {})
        url_probs = url_result.get("raw_probabilities", {})
        
        for disease in ['cordana', 'healthy', 'pestalotiopsis', 'sigatoka']:
            file_p = file_probs.get(disease, 0)
            url_p = url_probs.get(disease, 0)
            diff = abs(file_p - url_p)
            status = "✅" if diff < 0.05 else "⚠️" if diff < 0.15 else "❌"
            print(f"  {disease:15s}: File={file_p:.4f}, URL={url_p:.4f}, Diff={diff:.4f} {status}")

def main():
    print("🍌 Banana Disease Classification API Test")
    print("Testing both file upload and URL prediction methods")
    
    # Test file upload
    if Path(TEST_IMAGE_PATH).exists():
        file_result = test_file_upload(TEST_IMAGE_PATH)
    else:
        print(f"\n⚠️ Test image not found at: {TEST_IMAGE_PATH}")
        print("Please update TEST_IMAGE_PATH in the script")
        file_result = None
    
    # Test URL prediction
    print(f"\n⚠️ Please update TEST_IMAGE_URL in the script with your hosted image URL")
    print(f"Current URL: {TEST_IMAGE_URL}")
    
    response = input("\nDo you want to test URL prediction? (y/n): ")
    if response.lower() == 'y':
        custom_url = input("Enter image URL (or press Enter to use default): ").strip()
        if custom_url:
            TEST_IMAGE_URL = custom_url
        url_result = test_url_prediction(TEST_IMAGE_URL)
    else:
        url_result = None
    
    # Compare results
    if file_result and url_result:
        compare_results(file_result, url_result)
    
    print("\n" + "="*60)
    print("Test completed!")
    print("="*60)

if __name__ == "__main__":
    main()
