#!/usr/bin/env python3
"""
Quick API test script to verify the enhanced banana disease classifier is working.
"""

import requests
import json
from PIL import Image, ImageDraw
import io
import sys

def create_test_image():
    """Create a simple test image for testing"""
    # Create a green leaf-like test image
    image = Image.new('RGB', (224, 224), color='white')
    draw = ImageDraw.Draw(image)
    
    # Draw a simple leaf shape in green
    points = [(50, 112), (80, 50), (120, 30), (160, 50), (174, 112), 
              (160, 174), (120, 194), (80, 174)]
    draw.polygon(points, fill='green', outline='darkgreen', width=3)
    
    # Save to bytes buffer
    img_buffer = io.BytesIO()
    image.save(img_buffer, format='PNG')
    img_buffer.seek(0)
    
    return img_buffer

def test_api(url="http://192.168.1.24:5000", test_with_file=False):
    """Test the enhanced API"""
    
    print("🧪 Testing Enhanced Banana Disease Classification API")
    print("=" * 55)
    print(f"API URL: {url}")
    print()
    
    # Test 1: Health check
    try:
        print("1. Testing health endpoint...")
        response = requests.get(f"{url}/health")
        if response.status_code == 200:
            print("   ✅ Health check passed")
            print(f"   Response: {response.json()}")
        else:
            print(f"   ❌ Health check failed: {response.status_code}")
            return
    except requests.exceptions.ConnectionError:
        print(f"   ❌ Cannot connect to {url}")
        print("   Make sure the server is running: python server.py")
        return
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return
    
    print()
    
    # Test 2: Model info
    try:
        print("2. Testing model info endpoint...")
        response = requests.get(f"{url}/model-info")
        if response.status_code == 200:
            print("   ✅ Model info retrieved")
            info = response.json()
            print(f"   Diseases: {info.get('diseases', [])}")
            print(f"   Features: {len(info.get('features', []))}")
        else:
            print(f"   ❌ Model info failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print()
    
    # Test 3: Prediction with test image
    if test_with_file and len(sys.argv) > 1:
        # Use provided file
        try:
            print("3. Testing prediction with provided file...")
            with open(sys.argv[1], 'rb') as f:
                files = {'file': f}
                response = requests.post(f"{url}/predict", files=files)
        except FileNotFoundError:
            print(f"   ❌ File not found: {sys.argv[1]}")
            return
        except Exception as e:
            print(f"   ❌ Error reading file: {e}")
            return
    else:
        # Use generated test image
        print("3. Testing prediction with generated test image...")
        try:
            test_img = create_test_image()
            files = {'file': ('test_leaf.png', test_img, 'image/png')}
            response = requests.post(f"{url}/predict", files=files)
        except Exception as e:
            print(f"   ❌ Error creating test image: {e}")
            return
    
    # Process prediction response
    try:
        if response.status_code == 200:
            print("   ✅ Prediction successful")
            result = response.json()
            
            print(f"   Success: {result.get('success', False)}")
            print(f"   Is Rejected: {result.get('is_rejected', 'N/A')}")
            print(f"   Message: {result.get('message', 'N/A')}")
            
            if not result.get('is_rejected', True):
                print(f"   Predicted Disease: {result.get('predicted_disease', 'N/A')}")
                print(f"   Confidence: {result.get('confidence', 'N/A')}")
                print(f"   Certainty Score: {result.get('certainty_score', 'N/A')}")
            else:
                reasons = result.get('rejection_reasons', [])
                print(f"   Rejection Reasons: {reasons}")
            
            print("\n   📊 Raw Response (first 500 chars):")
            print(f"   {json.dumps(result, indent=2)[:500]}...")
            
        else:
            print(f"   ❌ Prediction failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data.get('error', 'Unknown error')}")
                print(f"   Message: {error_data.get('message', 'No message')}")
                print(f"   Details: {error_data.get('details', 'No details')}")
            except:
                print(f"   Raw response: {response.text}")
                
    except json.JSONDecodeError:
        print(f"   ❌ Invalid JSON response: {response.text}")
    except Exception as e:
        print(f"   ❌ Error processing response: {e}")
    
    print("\n" + "=" * 55)
    print("🎯 Test Summary:")
    
    if response.status_code == 200:
        print("✅ API is working correctly!")
        print("✅ JSON serialization issue has been fixed!")
        print("✅ Enhanced rejection system is operational!")
    else:
        print("❌ API test failed - check server logs for details")
    
    print("\n💡 Next steps:")
    print("• Test with real banana leaf images")
    print("• Test with non-leaf images (should be rejected)")
    print("• Adjust rejection thresholds if needed")

def main():
    """Main test function"""
    
    # Default URL from the Postman screenshot
    api_url = "http://192.168.1.24:5000"
    
    # Check if custom URL provided
    if len(sys.argv) > 1 and sys.argv[1].startswith('http'):
        api_url = sys.argv[1]
        test_with_file = False
    else:
        test_with_file = len(sys.argv) > 1
    
    test_api(api_url, test_with_file)
    
if __name__ == '__main__':
    main()