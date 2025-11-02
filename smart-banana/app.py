import streamlit as st
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
from enhanced_inference import BananaLeafClassifier

# Initialize the enhanced classifier
@st.cache_resource
def load_classifier():
    return BananaLeafClassifier('banana_disease_classification_model.keras')

# Load classifier
try:
    classifier = load_classifier()
    st.success("Enhanced Banana Disease Classifier loaded successfully!")
except Exception as e:
    st.error(f"Error loading classifier: {e}")
    st.stop()

st.title("🍌 Enhanced Banana Disease Classifier")
st.write("Upload an image of a banana leaf to detect diseases. Non-banana leaf images will be rejected.")

# Add information about what makes a good image
with st.expander("ℹ️ Tips for best results"):
    st.write("""
    - **Use clear images of banana leaves**
    - **Ensure good lighting**
    - **Avoid blurry or low-quality images**
    - **Images should primarily show the leaf**
    - **Non-banana leaf images will be automatically rejected**
    """)

# File uploader
uploaded_file = st.file_uploader("Choose an image...", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    # Display the uploaded image
    image = Image.open(uploaded_file)
    st.image(image, caption="Uploaded Image", use_column_width=True)
    
    # Add a predict button
    if st.button("🔍 Analyze Image", type="primary"):
        with st.spinner("Analyzing image..."):
            # Get prediction with rejection capability
            result = classifier.predict_with_rejection(image)
            
            # Display results
            if result["is_rejected"]:
                st.error("❌ Image Rejected")
                st.error(result["message"])
                
                # Show rejection reasons
                st.write("**Rejection Reasons:**")
                for reason in result["rejection_reasons"]:
                    st.write(f"• {reason}")
                    
                # Still show technical details in an expander
                with st.expander("🔧 Technical Details"):
                    col1, col2 = st.columns(2)
                    with col1:
                        st.metric("Max Confidence", f"{result['confidence']*100:.1f}%")
                        st.metric("Entropy (Uncertainty)", f"{result['entropy']:.3f}")
                    with col2:
                        st.metric("Appears to be leaf", "Yes" if result['is_leaf_like'] else "No")
                        st.metric("Predicted Class", result['predicted_class'])
                        
            else:
                st.success("✅ Valid Banana Leaf Detected")
                st.success(result["message"])
                
                # Display main results
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.metric("Disease", result["predicted_class"].title())
                with col2:
                    st.metric("Confidence", f"{result['confidence']*100:.1f}%")
                with col3:
                    st.metric("Certainty", f"{(1-result['entropy']/2)*100:.1f}%")
                
                # Create bar plot for all probabilities
                fig, ax = plt.subplots(figsize=(10, 6))
                diseases = list(result["all_probabilities"].keys())
                probabilities = list(result["all_probabilities"].values())
                
                bars = ax.bar(diseases, [p*100 for p in probabilities])
                
                # Color the bars - highest probability in green, others in blue
                max_idx = probabilities.index(max(probabilities))
                for i, bar in enumerate(bars):
                    if i == max_idx:
                        bar.set_color('#2E8B57')  # Sea green
                    else:
                        bar.set_color('#4682B4')  # Steel blue
                
                ax.set_title("Disease Classification Probabilities", fontsize=14, fontweight='bold')
                ax.set_xlabel("Disease Types", fontsize=12)
                ax.set_ylabel("Probability (%)", fontsize=12)
                ax.set_ylim(0, 100)
                
                # Add value labels on bars
                for i, (bar, prob) in enumerate(zip(bars, probabilities)):
                    height = bar.get_height()
                    ax.text(bar.get_x() + bar.get_width()/2., height + 1,
                           f'{prob*100:.1f}%', ha='center', va='bottom', fontweight='bold')
                
                # Rotate x-axis labels for better readability
                plt.setp(ax.get_xticklabels(), rotation=45, ha='right')
                plt.tight_layout()
                st.pyplot(fig)
                
                # Show disease information
                disease_info = {
                    "healthy": {
                        "description": "The leaf appears healthy with no visible signs of disease.",
                        "recommendation": "Continue regular monitoring and good agricultural practices."
                    },
                    "cordana": {
                        "description": "Cordana leaf spot is a fungal disease causing dark spots on leaves.",
                        "recommendation": "Apply fungicide and improve air circulation around plants."
                    },
                    "pestalotiopsis": {
                        "description": "Pestalotiopsis causes leaf spots and can lead to leaf blight.",
                        "recommendation": "Remove affected leaves and apply appropriate fungicide treatment."
                    },
                    "sigatoka": {
                        "description": "Sigatoka is a serious fungal disease causing yellowing and black streaks.",
                        "recommendation": "Immediate fungicide treatment and removal of affected leaves required."
                    }
                }
                
                predicted_disease = result["predicted_class"]
                if predicted_disease in disease_info:
                    with st.expander(f"📋 Information about {predicted_disease.title()}"):
                        st.write("**Description:**")
                        st.write(disease_info[predicted_disease]["description"])
                        st.write("**Recommendation:**")
                        st.write(disease_info[predicted_disease]["recommendation"])

# Add sidebar with model information
with st.sidebar:
    st.header("🤖 Model Information")
    st.write("**Model Type:** Convolutional Neural Network")
    st.write("**Classes:** 4 banana diseases")
    st.write("**Input Size:** 224x224 pixels")
    st.write("**Features:**")
    st.write("• Disease classification")
    st.write("• Non-banana leaf rejection")
    st.write("• Confidence assessment")
    st.write("• Uncertainty detection")
    
    st.header("📊 Detection Thresholds")
    st.write(f"**Min Confidence:** {classifier.min_confidence_threshold}")
    st.write(f"**Max Entropy:** {classifier.max_entropy_threshold}")
    st.write(f"**Feature Similarity:** {classifier.feature_similarity_threshold}")
    
    st.header("📝 Supported Diseases")
    for disease in classifier.diseases:
        st.write(f"• {disease.title()}")
