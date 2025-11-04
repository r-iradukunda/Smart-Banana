# ✅ DEPLOYMENT CHECKLIST

## Pre-Deployment

### Code Changes
- [x] `server.py` - Fixed URL image loading with BytesIO
- [x] `server.py` - Added image.load() calls in both endpoints
- [x] `server.py` - Added proper request headers
- [x] `server.py` - Added image validation
- [x] `enhanced_inference.py` - Improved preprocessing function
- [x] `enhanced_inference.py` - Added RGBA handling
- [x] `enhanced_inference.py` - Added shape assertions

### Testing Files Created
- [x] `test_both_endpoints.py` - Endpoint comparison
- [x] `verify_consistency.py` - Preprocessing verification
- [x] `quick_deploy.py` - Deployment automation
- [x] `DEPLOYMENT_FIX_README.md` - Detailed guide
- [x] `FIX_SUMMARY.md` - Complete summary

---

## Local Testing (REQUIRED)

### Step 1: Start Local Server
```bash
python server.py
```
Expected output: "Enhanced Banana Disease Classifier loaded successfully!"

- [ ] Server starts without errors
- [ ] Model loads successfully
- [ ] No import errors

### Step 2: Test File Upload
```bash
# In another terminal
curl -X POST -F "file=@0.jpeg" http://localhost:5000/predict
```

- [ ] Returns 200 status code
- [ ] `is_rejected` is `false`
- [ ] Confidence is > 60%
- [ ] Predicted disease makes sense

### Step 3: Test URL Prediction
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"url": "YOUR_IMAGE_URL"}' \
  http://localhost:5000/predict-url
```

- [ ] Returns 200 status code
- [ ] `is_rejected` is `false`
- [ ] Confidence is > 60%
- [ ] Predicted disease matches file upload

### Step 4: Compare Results
```bash
python test_both_endpoints.py
```

- [ ] Both endpoints tested successfully
- [ ] Predicted disease matches between endpoints
- [ ] Confidence difference < 5%
- [ ] Entropy difference < 0.1
- [ ] Same rejection status

### Step 5: Verify Preprocessing
```bash
python verify_consistency.py
```

- [ ] Arrays are nearly identical (difference < 1e-5)
- [ ] Predictions match
- [ ] No preprocessing errors

---

## Deployment Preparation

### Git Operations
```bash
# Check status
git status

# Add files
git add server.py enhanced_inference.py test_both_endpoints.py verify_consistency.py DEPLOYMENT_FIX_README.md FIX_SUMMARY.md quick_deploy.py CHECKLIST.md

# Commit
git commit -m "Fix: Image processing consistency between file upload and URL prediction"

# Push
git push origin main
```

- [ ] All modified files staged
- [ ] Commit message is descriptive
- [ ] Push successful

---

## Deployment

### Option A: Automated (Recommended)
```bash
python quick_deploy.py
```

- [ ] Script runs without errors
- [ ] All files verified
- [ ] Local tests pass (if chosen)
- [ ] Git commit created
- [ ] Code pushed to deployment

### Option B: Manual

#### For Heroku:
```bash
git push heroku main
heroku logs --tail
```

- [ ] Deploy successful
- [ ] No build errors
- [ ] Logs look normal

#### For Railway:
```bash
git push railway main
```

- [ ] Deploy triggered
- [ ] Build completes successfully
- [ ] Service is running

#### For Render:
```bash
git push origin main
# Check Render dashboard
```

- [ ] Auto-deploy triggered
- [ ] Build successful
- [ ] Service healthy

#### For other platforms:
- [ ] Follow platform-specific deployment
- [ ] Verify deployment succeeds
- [ ] Check logs for errors

---

## Post-Deployment Testing

### Step 1: Wait for Deployment
- [ ] Deployment status shows "successful" or "live"
- [ ] No error messages in deployment logs
- [ ] Service is accessible

### Step 2: Test Production API

#### Update Test Script
```python
# In test_both_endpoints.py, change:
API_URL = "https://your-production-url.com"  # Your actual URL
```

#### Health Check
```bash
curl https://your-production-url.com/health
```

- [ ] Returns `{"status": "healthy", "model_loaded": true}`
- [ ] Response time < 5 seconds

#### Test File Upload (Production)
- [ ] File upload works
- [ ] Predictions are reasonable
- [ ] Response time < 10 seconds

#### Test URL Prediction (Production)
- [ ] URL prediction works
- [ ] Predictions match file upload
- [ ] Response time < 15 seconds

#### Run Full Test Suite
```bash
python test_both_endpoints.py
```

- [ ] Both endpoints work on production
- [ ] Results are consistent
- [ ] No errors or timeouts

---

## Verification (24 Hours After Deployment)

### Monitor These Metrics:

#### Error Rate
- [ ] Error rate < 2%
- [ ] No new error types in logs
- [ ] All errors are expected/handled

#### Response Times
- [ ] File upload: < 10 seconds
- [ ] URL prediction: < 15 seconds
- [ ] Health check: < 1 second

#### Prediction Consistency
Test 10 random images:
- [ ] File and URL predictions match for each image
- [ ] Confidence scores are similar (< 5% diff)
- [ ] No unexpected rejections

#### User Feedback
- [ ] No complaints about inconsistent results
- [ ] No reports of failed predictions
- [ ] Positive feedback on accuracy

---

## Optional Optimizations (After Successful Deployment)

### Remove Debug Statements
```python
# Remove or comment out:
print(f"📸 Image loaded: mode={image.mode}, size={image.size}")
print(f"⚠️ Converting image from {image.mode} to RGB")
```

- [ ] Debug prints removed/reduced
- [ ] Logs are cleaner
- [ ] Performance slightly improved

### Add Caching (Optional)
```python
# Consider caching frequently requested images
from functools import lru_cache
```

- [ ] Caching implemented if needed
- [ ] Cache hit rate monitored
- [ ] Memory usage acceptable

### Add Monitoring (Recommended)
```python
# Add metrics/logging service
# Sentry, Datadog, New Relic, etc.
```

- [ ] Monitoring service integrated
- [ ] Alerts configured
- [ ] Dashboard created

---

## Rollback Procedure (If Issues Arise)

### Quick Rollback
```bash
git revert HEAD
git push origin main
```

- [ ] Previous version restored
- [ ] Service is stable
- [ ] Issue documented

### Temporary Disable URL Endpoint
```python
@app.route("/predict-url", methods=["POST"])
def predict_from_url():
    return jsonify({"error": "Temporarily unavailable"}), 503
```

- [ ] URL endpoint disabled
- [ ] File upload still works
- [ ] Users notified

---

## Sign-Off

### Before marking complete, verify:
- [ ] All local tests pass
- [ ] Code is deployed to production
- [ ] Production tests pass
- [ ] File and URL predictions are consistent
- [ ] No critical errors in logs
- [ ] Response times are acceptable
- [ ] Documentation is updated

### Deployment Completed By:
- Name: _______________
- Date: _______________
- Time: _______________

### Deployment Verified By:
- Name: _______________
- Date: _______________
- Time: _______________

---

## Quick Reference

### Useful Commands
```bash
# Test locally
python server.py
python test_both_endpoints.py

# Deploy
python quick_deploy.py

# Check logs (platform-specific)
heroku logs --tail
railway logs
# Or check dashboard

# Rollback
git revert HEAD && git push origin main
```

### Useful URLs
- Documentation: See `FIX_SUMMARY.md`
- Detailed Guide: See `DEPLOYMENT_FIX_README.md`
- API Health: `https://your-url.com/health`
- API Info: `https://your-url.com/`

---

**Status**: Ready for deployment ✅  
**Last Updated**: November 4, 2025  
**Next Review**: After 24 hours of production use
