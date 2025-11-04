#!/usr/bin/env python3
"""
Verify and fix Git LFS setup for large model files
"""

import subprocess
import os
import sys

def run_command(cmd, description):
    """Run a command and return success status"""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} - Success")
            if result.stdout.strip():
                print(f"   Output: {result.stdout.strip()}")
            return True
        else:
            print(f"❌ {description} - Failed")
            if result.stderr.strip():
                print(f"   Error: {result.stderr.strip()}")
            return False
    except Exception as e:
        print(f"❌ {description} - Error: {e}")
        return False

def check_git_lfs():
    """Check if Git LFS is installed and initialized"""
    print("="*70)
    print("CHECKING GIT LFS SETUP")
    print("="*70)
    
    # Check if Git LFS is installed
    if run_command("git lfs version", "Checking Git LFS installation"):
        print("✅ Git LFS is installed")
    else:
        print("\n❌ Git LFS is NOT installed!")
        print("\n📥 To install Git LFS:")
        print("   Windows: Download from https://git-lfs.github.com/")
        print("   Mac: brew install git-lfs")
        print("   Linux: sudo apt-get install git-lfs")
        return False
    
    # Check if Git LFS is initialized in this repo
    if run_command("git lfs ls-files", "Checking Git LFS tracked files"):
        print("✅ Git LFS is initialized in this repo")
    else:
        print("\n⚠️ Git LFS not initialized. Initializing now...")
        run_command("git lfs install", "Initializing Git LFS")
    
    return True

def check_model_in_lfs():
    """Check if model file is tracked by Git LFS"""
    print("\n" + "="*70)
    print("CHECKING MODEL FILE IN GIT LFS")
    print("="*70)
    
    model_file = "banana_disease_classification_model1.keras"
    
    if not os.path.exists(model_file):
        print(f"❌ Model file '{model_file}' not found!")
        return False
    
    # Check file size
    size_mb = os.path.getsize(model_file) / (1024 * 1024)
    print(f"📊 Model file size: {size_mb:.2f} MB")
    
    # Check if file is tracked by Git LFS
    result = subprocess.run("git lfs ls-files", shell=True, capture_output=True, text=True)
    
    if model_file in result.stdout:
        print(f"✅ {model_file} is tracked by Git LFS")
        return True
    else:
        print(f"❌ {model_file} is NOT tracked by Git LFS")
        print("\n📝 To track it with Git LFS:")
        print(f"   git lfs track '{model_file}'")
        print(f"   git add .gitattributes")
        print(f"   git add '{model_file}'")
        print(f"   git commit -m 'Track model with Git LFS'")
        return False

def fix_git_lfs():
    """Try to automatically fix Git LFS setup"""
    print("\n" + "="*70)
    print("ATTEMPTING TO FIX GIT LFS SETUP")
    print("="*70)
    
    model_file = "banana_disease_classification_model1.keras"
    
    # Track the model file
    run_command(f"git lfs track '{model_file}'", "Tracking model with Git LFS")
    run_command(f"git lfs track '*.keras'", "Tracking all .keras files")
    run_command(f"git lfs track '*.h5'", "Tracking all .h5 files")
    
    # Add .gitattributes
    run_command("git add .gitattributes", "Adding .gitattributes")
    
    # Add model file
    run_command(f"git add '{model_file}'", f"Adding {model_file}")
    
    print("\n✅ Git LFS setup complete!")
    print("\n📝 Next steps:")
    print("   1. git commit -m 'Track model files with Git LFS'")
    print("   2. git push origin main")

def check_deployment_platform():
    """Check if deployment platform supports Git LFS"""
    print("\n" + "="*70)
    print("DEPLOYMENT PLATFORM CHECK")
    print("="*70)
    
    print("\n🔍 Does your deployment platform support Git LFS?")
    print("\n✅ Platforms WITH Git LFS support:")
    print("   - Heroku (with buildpack)")
    print("   - Railway (native support)")
    print("   - Render (native support)")
    print("   - GitHub Pages (not for large files)")
    
    print("\n❌ Platforms WITHOUT Git LFS support:")
    print("   - Most free tiers")
    print("   - Some PaaS providers")
    
    print("\n💡 If your platform doesn't support Git LFS:")
    print("   → Use Option 1: Upload model to Google Drive/Dropbox")
    print("   → See: setup_model_cloud.py")

def main():
    print("="*70)
    print("GIT LFS MODEL SETUP HELPER")
    print("="*70)
    
    # Check Git LFS
    if not check_git_lfs():
        print("\n❌ Git LFS not available. Use Option 1 instead (Google Drive)")
        return
    
    # Check if model is tracked
    if check_model_in_lfs():
        print("\n✅ Everything looks good!")
        print("\n📝 To deploy:")
        print("   1. Ensure your changes are committed")
        print("   2. Push to your deployment branch")
        print("   3. Verify model file uploaded (check repo on GitHub/GitLab)")
    else:
        # Try to fix
        response = input("\n🔧 Attempt to fix Git LFS setup? (y/n): ").strip().lower()
        if response == 'y':
            fix_git_lfs()
        else:
            print("\n💡 Manual fix required. Follow the instructions above.")
    
    # Check deployment platform
    check_deployment_platform()
    
    print("\n" + "="*70)
    print("DONE!")
    print("="*70)

if __name__ == "__main__":
    main()
