# Deployment Fix Checklist

## Pre-Deployment (Local Machine)

### 1. Model Conversion ⬜
```bash
cd smart-banana
python model_converter.py
```
- [ ] Script runs without errors
- [ ] `saved_models/banana_mobilenetv2_final.h5` created
- [ ] File size reasonable (< 200MB)

### 2. File Updates ⬜
```bash
# Backup
cp server.py server_backup.py
cp enhanced_inference.py enhanced_inference_backup.py

# Update
cp server_v2.py server.py
cp enhanced_inference_v2.py enhanced_inference.py
```
- [ ] Backups created
- [ ] Files updated

### 3. Local Testing ⬜
```bash
# Test model loading
python -c "from enhanced_inference import BananaLeafClassifier; c = BananaLeafClassifier('saved_models/banana_mobilenetv2_final.h5'); print('Success!')"

# Test server
python server.py
```
- [ ] Model loads without errors
- [ ] Server starts successfully
- [ ] Health endpoint works: `curl http://localhost:5000/health`

### 4. Git Operations ⬜

#### Option A: Files < 100MB (No LFS needed)
```bash
git add .
git commit -m "Fix: Model loading compatibility for Render deployment"
git push
```
- [ ] Changes added
- [ ] Committed
- [ ] Pushed successfully

#### Option B: Files > 100MB (Use Git LFS)
```bash
git lfs install
git lfs track "*.h5"
git lfs track "*.keras"
git add .gitattributes
git add .
git commit -m "Fix: Model loading with Git LFS support"
git push
```
- [ ] Git LFS installed
- [ ] H5 and Keras files tracked
- [ ] .gitattributes committed
- [ ] All changes pushed

---

## Deployment Monitoring

### 5. Render Build ⬜
- [ ] Build triggered automatically
- [ ] Build logs show model files detected
- [ ] No Python package errors
- [ ] Build completes successfully

**Expected in logs:**
```
✅ Found model at: .../saved_models/banana_mobilenetv2_final.h5
🔄 Attempting to load model from ...
   📍 Strategy 1: Standard Keras loading...
   ✅ Strategy 1 succeeded!
```

### 6. Service Start ⬜
- [ ] Service starts without crashes
- [ ] No model loading errors
- [ ] "Server Status: 🟢 READY" in logs

---

## Post-Deployment Testing

### 7. Basic Health Checks ⬜
```bash
# Health endpoint
curl https://smart-banana.onrender.com/health
```
**Expected response:**
```json
{
  "status": "healthy",
  "model_loaded": true
}
```
- [ ] Returns 200 OK
- [ ] Status is "healthy"
- [ ] Model is loaded

### 8. Debug Info ⬜
```bash
curl https://smart-banana.onrender.com/debug
```
- [ ] Shows H5 file in `files_in_saved_models`
- [ ] `model_loaded` is true
- [ ] TensorFlow version shown

### 9. Model Info ⬜
```bash
curl https://smart-banana.onrender.com/model-info
```
- [ ] Returns model details
- [ ] Shows 4 diseases
- [ ] No error response

### 10. Prediction Test ⬜
```bash
curl -X POST https://smart-banana.onrender.com/predict \
  -F "file=@test_banana_leaf.jpg"
```
- [ ] Returns prediction
- [ ] Confidence score shown
- [ ] No 500 errors

---

## Integration Testing

### 11. Mobile App Connection ⬜
- [ ] App can connect to API
- [ ] Image upload works
- [ ] Results display correctly
- [ ] Error messages clear

### 12. Load Testing ⬜
- [ ] Send 10 requests in sequence
- [ ] All return valid responses
- [ ] No timeouts or crashes
- [ ] Response time acceptable

---

## Troubleshooting Checklist

### If Build Fails ⬜
- [ ] Check Python version matches (3.11)
- [ ] Verify requirements.txt is complete
- [ ] Check for file size issues
- [ ] Review Render build logs

### If Model Won't Load ⬜
- [ ] Verify H5 file exists in repo
- [ ] Check file wasn't corrupted during push
- [ ] Review strategy logs in Render
- [ ] Try weights-only fallback

### If Predictions Fail ⬜
- [ ] Check model loaded (debug endpoint)
- [ ] Verify image format supported
- [ ] Test with known good image
- [ ] Review error logs

---

## Rollback Plan

### If Deployment Fails ⬜
```bash
# Restore backups
cp server_backup.py server.py
cp enhanced_inference_backup.py enhanced_inference.py

# Revert commit
git revert HEAD
git push

# Or restore from previous commit
git reset --hard HEAD~1
git push --force
```
- [ ] Backups available
- [ ] Know how to rollback
- [ ] Previous deployment URL saved

---

## Final Verification

### 13. Complete System Test ⬜
- [ ] Health: ✅ Healthy
- [ ] Model: ✅ Loaded  
- [ ] Predict: ✅ Works
- [ ] Mobile: ✅ Connected
- [ ] Performance: ✅ Acceptable
- [ ] Errors: ✅ None

---

## Success Criteria

✅ All checkboxes checked  
✅ No errors in logs  
✅ Predictions working correctly  
✅ Mobile app integrated  
✅ Response times good  

---

## Quick Commands Reference

```bash
# Local test
python model_converter.py && python -c "from enhanced_inference import BananaLeafClassifier; c = BananaLeafClassifier('saved_models/banana_mobilenetv2_final.h5')"

# Deploy
git add . && git commit -m "Fix model loading" && git push

# Test production
curl https://smart-banana.onrender.com/health && curl https://smart-banana.onrender.com/debug

# Full test with image
curl -X POST https://smart-banana.onrender.com/predict -F "file=@test.jpg"
```

---

## Notes
- Date deployed: _______________
- Deployment duration: _______________
- Issues encountered: _______________
- Resolution notes: _______________

---

## Sign-off
- [ ] Tested by: _______________
- [ ] Approved by: _______________
- [ ] Date: _______________
