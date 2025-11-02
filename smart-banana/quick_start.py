#!/usr/bin/env python3
"""
Quick start script for the Enhanced Banana Disease Classification System
"""

import subprocess
import sys
import os
import time

def check_dependencies():
    """Check if required packages are installed"""
    print("🔍 Checking dependencies...")
    
    required_packages = [
        'tensorflow', 'flask', 'flask_cors', 'pillow', 
        'numpy', 'opencv-python', 'matplotlib'
    ]
    
    missing = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"   ✅ {package}")
        except ImportError:
            print(f"   ❌ {package} (missing)")
            missing.append(package)
    
    if missing:
        print(f"\n📦 Installing missing packages: {', '.join(missing)}")
        try:
            subprocess.run([sys.executable, '-m', 'pip', 'install'] + missing, check=True)
            print("   ✅ Installation completed")
        except subprocess.CalledProcessError:
            print("   ❌ Installation failed - please install manually")
            return False
    
    return True

def check_model_file():
    """Check if the model file exists"""
    print("\n🧠 Checking model file...")
    
    model_file = 'banana_disease_classification_model.keras'
    if os.path.exists(model_file):
        size_mb = os.path.getsize(model_file) / (1024 * 1024)
        print(f"   ✅ Model file found ({size_mb:.1f} MB)")
        return True
    else:
        print(f"   ❌ Model file not found: {model_file}")
        print("   Please run the training notebook first to create the model")
        return False

def test_enhanced_inference():
    """Test the enhanced inference system"""
    print("\n🧪 Testing enhanced inference...")
    
    try:
        from enhanced_inference import BananaLeafClassifier
        classifier = BananaLeafClassifier('banana_disease_classification_model.keras')
        print("   ✅ Enhanced classifier loaded successfully")
        print(f"   ✅ Diseases: {classifier.diseases}")
        print(f"   ✅ Rejection thresholds configured")
        return True
    except Exception as e:
        print(f"   ❌ Error loading enhanced classifier: {e}")
        return False

def start_server():
    """Start the Flask API server"""
    print("\n🚀 Starting API server...")
    print("   Server will start at: http://localhost:5000")
    print("   Press Ctrl+C to stop the server")
    print("\n" + "="*50)
    
    try:
        import subprocess
        subprocess.run([sys.executable, 'server.py'])
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")

def start_streamlit():
    """Start the Streamlit web app"""
    print("\n🌐 Starting Streamlit web app...")
    print("   Web app will start at: http://localhost:8501")
    print("   Press Ctrl+C to stop the app")
    print("\n" + "="*50)
    
    try:
        subprocess.run([sys.executable, '-m', 'streamlit', 'run', 'app.py'])
    except KeyboardInterrupt:
        print("\n👋 Streamlit app stopped by user")
    except Exception as e:
        print(f"\n❌ Error starting Streamlit: {e}")

def run_tests():
    """Run the test suite"""
    print("\n🧪 Running test suite...")
    
    try:
        subprocess.run([sys.executable, 'test_enhanced_model.py'])
        print("\n✅ Tests completed")
    except Exception as e:
        print(f"\n❌ Error running tests: {e}")

def run_demo():
    """Run the interactive demo"""
    print("\n🎬 Running interactive demo...")
    
    try:
        subprocess.run([sys.executable, 'demo.py'])
    except Exception as e:
        print(f"\n❌ Error running demo: {e}")

def main():
    """Main function"""
    print("🍌 Enhanced Banana Disease Classification - Quick Start")
    print("=" * 60)
    
    # Step 1: Check dependencies
    if not check_dependencies():
        return
    
    # Step 2: Check model file
    if not check_model_file():
        return
    
    # Step 3: Test enhanced inference
    if not test_enhanced_inference():
        return
    
    print("\n🎉 All checks passed! System ready!")
    print("\n📋 Available options:")
    print("1. Start API server (for Postman/API testing)")
    print("2. Start Streamlit web app (for web interface)")  
    print("3. Run test suite")
    print("4. Run interactive demo")
    print("5. Exit")
    
    while True:
        try:
            choice = input("\n👉 Choose an option (1-5): ").strip()
            
            if choice == '1':
                start_server()
            elif choice == '2':
                start_streamlit()
            elif choice == '3':
                run_tests()
            elif choice == '4':
                run_demo()
            elif choice == '5':
                print("👋 Goodbye!")
                break
            else:
                print("❌ Invalid choice. Please enter 1-5.")
                
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
