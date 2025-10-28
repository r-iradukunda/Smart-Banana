# Banana Disease Detection

Deep learning mobile application for real-time banana disease detection in Rwanda. Provides treatment recommendations with Kinyarwanda voice support for farmers.

---

## Overview

Banana diseases cause **70% yield loss** in Rwanda, affecting 2.5+ million farmers. This AI system provides:
- **Real-time disease detection** using smartphone cameras
- **Offline-capable** CNN model (84% accuracy)
- **Voice output** in Kinyarwanda for accessibility
- **Treatment recommendations** from RAB guidelines

---

##  Detected Diseases

- Cordana Leaf Spot
- Black Sigatoka  
- Pestalotiopsis
- Banana Xanthomonas Wilt (BXW)
- Healthy Classification

---

##  Tech Stack

**ML:** TensorFlow/Keras, Custom CNN  
**Mobile:** React Native/Flutter  
**Backend:** Python/Flask  
**TTS:** Pindo AI (Kinyarwanda)

---

##  Installation

```bash
# Clone repository
git clone https://github.com/r-iradukunda/Smart-Banana
cd Smart-Banana

# Install dependencies
pip install -r requirements.txt
```

**Requirements:**
```
tensorflow>=2.13.0
keras>=2.13.0
numpy>=1.24.0
pandas>=2.0.0
matplotlib>=3.7.0
pillow>=10.0.0
```

---

##  Usage

### Python Inference

```python
from tensorflow import keras
import numpy as np
from PIL import Image

# Load model
model = keras.models.load_model('models/banana_disease_model.keras')

# Predict
img = Image.open('banana_leaf.jpg').resize((224, 224))
img_array = np.expand_dims(np.array(img) / 255.0, axis=0)
prediction = model.predict(img_array)

classes = ['cordana', 'healthy', 'pestalotiopsis', 'sigatoka']
result = classes[np.argmax(prediction)]
print(f"Disease: {result} ({np.max(prediction)*100:.2f}%)")
```

### Training

```bash
python src/train.py
# Or use Jupyter notebook
jupyter notebook notebooks/smart_banana.ipynb
```

---

## Performance

| Metric | Value |
|--------|-------|
| Validation Accuracy | 84.38% |
| Inference Time | <2 sec |
| Model Size | ~15 MB |

**Field Testing:** 90%+ accuracy with 50 farmers in Eastern Province

---

## Project Structure

```
├── data/               # Dataset (1,600 images)
├── models/             # Trained models
├── notebooks/          # Training notebook
├── src/                # Python scripts
├── mobile/             # Mobile app
└── docs/               # Research documents
```

---

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/NewFeature`)
3. Commit changes (`git commit -m 'Add NewFeature'`)
4. Push to branch (`git push origin feature/NewFeature`)
5. Open Pull Request

---

##  Team

**Iradukunda Ruth** - Lead Developer  
**Mr. Tunde Isaiq Gbadamosi** - Supervisor

BSc Software Engineering Capstone Project

---

## Contact

 Email: r.iradukund@alustudent.com  
 GitHub: https://github.com/r-iradukunda/Smart-Banana
 youtube: https://www.youtube.com/watch?v=q-tGzE9S0wQ&t=18s

---

## Roadmap

iOS app development
3 additional diseases
Weather data integration
Farmer community features

---

<div align="center">

**Made with for Rwandan farmers**

Star this repo if you find it useful!

</div>
