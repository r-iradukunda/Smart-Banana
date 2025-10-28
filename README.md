**Smart Banana — Banana Leaf Disease Detection**
# Overview

Smart Banana is a deep learning project that leverages Convolutional Neural Networks (CNNs) to automatically detect and classify banana leaf diseases from images.

It helps farmers and agricultural experts identify Cordana, Pestalotiopsis, and Sigatoka diseases, as well as recognize healthy leaves.
The notebook provides a complete end-to-end pipeline — from data loading and augmentation to model training, evaluation, and visualization.

## Project Structure
**Path	                              Description**
smart_banana.ipynb	                  Main Jupyter notebook for training and analysis.
BananaLSD/	                          Dataset root directory.
BananaLSD/AugmentedSet/	              Folder containing processed image data.
BananaLSD/AugmentedSet/cordana/	Images of banana leaves infected with Cordana disease.
BananaLSD/AugmentedSet/healthy/	      Images of healthy banana leaves.
BananaLSD/AugmentedSet/pestalotiopsis/Images showing Pestalotiopsis disease symptoms.
BananaLSD/AugmentedSet/sigatoka/	  Images of leaves affected by Sigatoka disease.

### Requirements
**Package                 Purpose**
tensorflow	              Deep learning framework for CNN model building and training.
numpy	                  Numerical computations and array manipulation.
pandas	                  Data analysis and organization.
matplotlib	              Visualization of training metrics and images.
scipy	                  Scientific computations and image processing.
(Optional) opencv-python  Image manipulation and preprocessing.
(Optional) tqdm	          Progress bars for training loops.

Install everything with: pip install tensorflow numpy pandas matplotlib scipy opencv-python tqdm

#### Workflow
**Step**	**Task**	            **Description**
1	Import Dependencies	    Load TensorFlow, Keras, NumPy, Pandas, and Matplotlib.
2	Set Up Dataset	        Define paths and verify image counts for each class.
3	Data Augmentation	    Apply rotation, flip, and zoom using ImageDataGenerator.
4	Build Model	            Create CNN architecture with Conv2D, MaxPooling2D, Dense
5	Compile Model	        Use Adam optimizer and categorical cross-entropy loss.
6	Train Model	            Train with callbacks (EarlyStopping, ReduceLROnPlateau).
7	Evaluate Model	        Generate accuracy/loss plots and test predictions.
8	Visualize Results	    Display predicted vs. true labels.

##### Dataset Summary
**Class	    Description	                                                    Example** 
Cordana	       Fungal leaf spot 	                                               400
Healthy	Normal banana leaf, no disease.	                                           400
Pestalotiopsis Leaf blight caused by Pestalotiopsis fungus.	                       400
Sigatoka	   Common banana leaf spot disease.	                                   400

###### Model Architecture**
**Component	                     Description**
Input Layer	                     Accepts resized images (e.g., 128×128×3).
Convolutional Layers	         Extract spatial features using small filters.
Pooling Layers	                 Reduce feature map size to lower computation.
Dropout Layers	                 Prevent overfitting by randomly deactivating neurons.
Dense Layers	                 Learn class-level representations.
Output Layer	                 Softmax activation with 4 neurons (one per disease).
Optimizer	                     Adam with adaptive learning rate.
Callbacks	                     EarlyStopping, ReduceLROnPlateau for smooth training.

##### Training & Evaluation Outputs
**Output	                          Description**
Training Accuracy Plot	          Shows model accuracy improvement per epoch.
Validation Accuracy Plot	      Demonstrates generalization to unseen data.
Loss Curves	                      Tracks training vs. validation loss.
Sample Predictions	              Visual comparison of predictions and labels.
Confusion Matrix	              Breakdown of classification performance by class.

Typical model accuracy: 80 – 95 %, depending on dataset size and model complexity.

#### Future Improvements**
**Area	                    Suggested Enhancement**
Transfer Learning	        Use pretrained models (EfficientNet, ResNet, InceptionV3).
Explainability	            Integrate Grad-CAM visualizations for interpretability.
Deployment	                Convert model to TensorFlow Lite for mobile devices.
User Interface	            Develop a web or mobile app for real-time detection.
Data Expansion	            Collect more diverse banana leaf samples.

### How to Run the Notebook
**Step	Action**
1	    Clone or download this repository.
2	    Open smart_banana.ipynb in Jupyter Notebook or VS Code.
3	    Update dataset path:base_dir = r'C:\path\to\BananaLSD\AugmentedSet'
4	    Run all cells sequentially.
5	    Review output metrics, plots, and predictions.

## Author
**Field	         Detail**
Author	         Iradukunda Ruth
Email	         r.iradukund@gmail.com
GitHub	         https://github.com/r-iradukunda/Smart-Banana
Project	         Smart Banana — Banana Leaf Disease Detection
youtube Video    https://youtube.com/q-tGzE9S0wQ

# Acknowledgments
**Contributor*                        Contribution**
TensorFlow / Keras	                 Core framework for model building.
BananaLSD Dataset	                 Image data source for training.
Open Source Community	             Inspiration and tools for agricultural A
