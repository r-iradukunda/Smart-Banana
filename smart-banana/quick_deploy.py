#!/usr/bin/env python3
"""
Quick Deploy Script - Fixes and deploys the consistency issue
"""

import os
import sys
import subprocess

def print_header(text):
    print("\n" + "="*70)
    print(text.center(70))
    print("="*70 + "\n")

def print_step(step_num, text):
    print(f"\n📍 Step {step_num}: {text}")
    print("-" * 70)

def run_command(command, description):
    """Run a shell command and handle errors"""
    print(f"   Running: {command}")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        if result.stdout:
            print(f"   ✅ {description} - Success")
            if result.stdout.strip():
                print(f"   Output: {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"   ❌ {description} - Failed")
        if e.stderr:
            print(f"   Error: {e.stderr.strip()}")
        return False

def main():
    print_header("🍌 BANANA DISEASE API - QUICK FIX DEPLOYMENT")
    
    print("This script will:")
    print("1. Verify all files are present")
    print("2. Test the fixes locally")
    print("3. Commit changes to Git")
    print("4. Help you deploy")
    
    response = input("\nProceed? (y/n): ").strip().lower()
    if response != 'y':
        print("Aborted.")
        return
    
    # Step 1: Verify files
    print_step(1, "Verifying Files")
    required_files = [
        'server.py',
        'enhanced_inference.py',
        'test_both_endpoints.py',
        'verify_consistency.py',
        'DEPLOYMENT_FIX_README.md'
    ]
    
    missing_files = []
    for file in required_files:
        if os.path.exists(file):
            print(f"   ✅ {file}")
        else:
            print(f"   ❌ {file} - MISSING")
            missing_files.append(file)
    
    if missing_files:
        print(f"\n❌ Missing files: {', '.join(missing_files)}")
        print("Please ensure all files are present before deploying.")
        return
    
    # Step 2: Test locally (optional)
    print_step(2, "Local Testing")
    test = input("Do you want to test locally first? (recommended) (y/n): ").strip().lower()
    
    if test == 'y':
        print("\n   Starting local server test...")
        print("   Please ensure your server is running (python server.py)")
        print("   Then press Enter when ready to test...")
        input()
        
        if os.path.exists('0.jpeg'):
            print("\n   Running test script...")
            run_command('python test_both_endpoints.py', 'Local test')
        else:
            print("   ⚠️ Test image '0.jpeg' not found. Skipping automated test.")
            print("   Please test manually.")
    
    # Step 3: Git operations
    print_step(3, "Git Operations")
    
    print("\n   Checking git status...")
    run_command('git status', 'Git status check')
    
    commit = input("\n   Do you want to commit these changes? (y/n): ").strip().lower()
    
    if commit == 'y':
        print("\n   Adding files to git...")
        run_command('git add server.py enhanced_inference.py test_both_endpoints.py verify_consistency.py DEPLOYMENT_FIX_README.md', 
                   'Adding files')
        
        commit_msg = "Fix: Image processing consistency between file upload and URL prediction\n\n"
        commit_msg += "- Fixed URL image loading to use BytesIO instead of response.raw\n"
        commit_msg += "- Added explicit image.load() calls to prevent lazy loading\n"
        commit_msg += "- Improved preprocessing consistency with better RGBA handling\n"
        commit_msg += "- Added shape validation and proper headers for URL requests\n"
        commit_msg += "- Enhanced error handling and image verification"
        
        print(f"\n   Commit message:\n{commit_msg}\n")
        
        if run_command(f'git commit -m "{commit_msg}"', 'Committing changes'):
            print("\n   ✅ Changes committed successfully!")
        else:
            print("\n   ⚠️ Commit failed or no changes to commit")
    
    # Step 4: Deployment guidance
    print_step(4, "Deployment")
    
    print("\n   Your deployment options:")
    print("\n   1. 🚀 If using Git-based deployment (Heroku, Railway, Render, etc.):")
    print("      Run: git push origin main")
    print("      (or whatever your deployment branch is)")
    
    print("\n   2. 📦 If using platform-specific deployment:")
    print("      - Heroku: git push heroku main")
    print("      - Railway: git push railway main")
    print("      - Render: Push will auto-deploy from GitHub")
    print("      - AWS/GCP: Follow your platform's deployment process")
    
    print("\n   3. 🐳 If using Docker:")
    print("      - Rebuild your container with the updated code")
    print("      - Push to your container registry")
    
    deploy_now = input("\n   Do you want to push to your deployment branch now? (y/n): ").strip().lower()
    
    if deploy_now == 'y':
        branch = input("   Enter branch name (default: main): ").strip() or 'main'
        remote = input("   Enter remote name (default: origin): ").strip() or 'origin'
        
        if run_command(f'git push {remote} {branch}', f'Pushing to {remote}/{branch}'):
            print("\n   ✅ Code pushed successfully!")
            print("\n   🎉 Deployment initiated!")
        else:
            print("\n   ❌ Push failed. Please check your git configuration.")
    
    # Step 5: Post-deployment
    print_step(5, "Post-Deployment")
    
    print("\n   After deployment completes:")
    print("\n   1. Wait for deployment to finish (check your platform's dashboard)")
    print("\n   2. Test your production API:")
    print("      - Update API_URL in test_both_endpoints.py to your production URL")
    print("      - Run: python test_both_endpoints.py")
    print("\n   3. Monitor your logs for any errors")
    print("\n   4. Verify that file upload and URL prediction give consistent results")
    
    print("\n   📖 For detailed information, see: DEPLOYMENT_FIX_README.md")
    
    print_header("✅ DEPLOYMENT PREPARATION COMPLETE")
    
    print("\nNext steps:")
    print("1. Wait for deployment to complete")
    print("2. Test production endpoints")
    print("3. Monitor for 24 hours")
    print("4. Remove debug print statements if everything works")
    
    print("\n🎉 Good luck with your deployment!")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️ Deployment cancelled by user.")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
