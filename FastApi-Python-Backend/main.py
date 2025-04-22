import os
# Set environment variables before importing TensorFlow
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Suppress TensorFlow logging
os.environ['SM_FRAMEWORK'] = 'tf.keras'
os.environ['gemini_api_key'] = "AIzaSyAq0X9AFp6qFy7uyMCTyDMqtsPnjvQxwYs"

from tensorflow.keras.models import load_model as tf_load_model
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import io
import os
import numpy as np
import uuid
import shutil
from pathlib import Path
import rasterio
from rasterio.io import MemoryFile
import cv2
from sklearn.preprocessing import MinMaxScaler
import segmentation_models as sm

# Add these imports at the top of your file
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
import base64
from typing import Dict, Any
import json

# Configure Gemini API
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))

# Create directories for storing images
UPLOAD_DIR = Path("uploaded_images")
RESULTS_DIR = Path("prediction_results")
UPLOAD_DIR.mkdir(exist_ok=True)
RESULTS_DIR.mkdir(exist_ok=True)

# Path to default image
DEFAULT_IMAGE_PATH = Path("image.png")

# Path to store the latest prediction
LATEST_PREDICTION_PATH = RESULTS_DIR / "latest_prediction.jpg"

# Create FastAPI app
app = FastAPI(title="UHI Detector API", description="API for urban heat island detection with ResNet34")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Modify in production to only allow specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the pre-trained model
def load_model():
    try:
        
        # Load the model from the .hdf5 file
        model = tf_load_model("landcover_50_epochs_resnet34_backbone_batch16_freeze_iou_0.78.hdf5", compile=False)
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        return None

# Initialize the model
model = load_model()

# Image preprocessing
def preprocess_image(image):
    """
    Enhanced preprocessing for UHI detection
    """
    try:
        # Convert to numpy array if PIL Image
        if isinstance(image, Image.Image):
            img_array = np.array(image)
        else:
            img_array = image
            
        # Ensure image is in RGB format
        if len(img_array.shape) == 2:  # Grayscale
            img_array = np.stack((img_array,) * 3, axis=-1)
            
        # Resize to model input size
        img_resized = cv2.resize(img_array, (256, 256))
        
        # Normalize pixel values
        img_normalized = img_resized.astype('float32') / 255.0
        
        # Add batch dimension
        img_batch = np.expand_dims(img_normalized, axis=0)
        
        return img_batch
    except Exception as e:
        print(f"Preprocessing error: {e}")
        return None

# Process the image and make predictions
def process_image(image_path):
    """
    Process image and return UHI visualization with improved prediction
    """
    try:
        # Initialize preprocessing tools
        scaler = MinMaxScaler()
        preprocess_input = sm.get_preprocessing('resnet34')
        
        # Read image using rasterio
        with rasterio.open(image_path) as dataset:
            img_array = dataset.read()
            img_meta = dataset.meta
            
        # Move channel information to third axis
        img_array = np.moveaxis(img_array, source=0, destination=2)
        
        # Resize image to match model's expected input shape
        img_resized = cv2.resize(img_array, (256, 256))
        
        # Normalize image values between 0 and 1
        input_img = scaler.fit_transform(
            img_resized.reshape(-1, img_resized.shape[-1])
        ).reshape(img_resized.shape)
        
        # Apply model-specific preprocessing
        input_img = preprocess_input(input_img)
        
        # Add batch dimension and make prediction
        input_tensor = np.expand_dims(input_img, axis=0)
        predictions = model.predict(input_tensor)
        
        # Process predictions and create visualization using original dimensions
        confidence_scores = np.max(predictions[0], axis=-1)
        pred_mask = np.argmax(predictions[0], axis=-1)
        
        # Scale prediction mask back to original size
        pred_mask = cv2.resize(
            pred_mask.astype(float), 
            (img_array.shape[1], img_array.shape[0]), 
            interpolation=cv2.INTER_NEAREST
        ).astype(int)
        
        confidence_scores = cv2.resize(
            confidence_scores, 
            (img_array.shape[1], img_array.shape[0]), 
            interpolation=cv2.INTER_LINEAR
        )
        
        # Create RGBA visualization
        height, width = pred_mask.shape
        rgba_mask = np.zeros((height, width, 4), dtype=np.uint8)
        
        # Define UHI classes and colors
        uhi_classes = {
            0: {"name": "No UHI", "color": [0, 0, 0], "alpha": 0},
            1: {"name": "High UHI", "color": [255, 0, 0], "alpha": 78},  # Red with 20% opacity
            2: {"name": "Medium UHI", "color": [255, 255, 0], "alpha": 78},  # Yellow with 20% opacity
            3: {"name": "Low UHI", "color": [0, 255, 0], "alpha": 78}  # Green with 20% opacity
        }
        
        # Apply colors with confidence-based alpha
        for class_idx, class_info in uhi_classes.items():
            mask = pred_mask == class_idx
            if class_idx > 0:  # Skip background
                rgba_mask[mask, 0:3] = class_info["color"]
                alpha = np.clip(
                    confidence_scores[mask] * class_info["alpha"],
                    0,
                    class_info["alpha"]
                ).astype(np.uint8)
                rgba_mask[mask, 3] = alpha
        
        # Convert to PIL Image for final composition
        result_image = Image.fromarray(rgba_mask, 'RGBA')
        original_img = Image.fromarray(img_array).convert('RGBA')
        original_resized = original_img.resize((width, height))
        
        # Create final composite
        result = Image.new('RGBA', (width, height))
        result.paste(original_resized, (0, 0))
        result.alpha_composite(result_image, (0, 0))
        
        # Save with metadata
        result_image_path = RESULTS_DIR / f"{uuid.uuid4()}.png"
        result.save(
            result_image_path, 
            format='PNG',
            optimize=True
        )
        shutil.copy(result_image_path, LATEST_PREDICTION_PATH)
        
        return result_image_path
        
    except Exception as e:
        print(f"Error processing image: {e}")
        return None

def analyze_uhi_with_gemini(image_path: Path) -> Dict[Any, Any]:
    """
    Analyze this Urban Heat Island (UHI) prediction segmented image and extract valuable insights for climate adaptation and urban planning.

    """
    try:
        # Load the Gemini Pro Vision model
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Read image file
        with open(image_path, 'rb') as img_file:
            image_bytes = img_file.read()
        
        # Encode image to base64
        image_b64 = base64.b64encode(image_bytes).decode()
        
        # Prepare the prompt
        prompt = """
        Analyze this Urban Heat Island (UHI) prediction image and provide recommendations.
        Return only a JSON object without any markdown formatting or additional text.
        Format:
        {
        "analysis": {
            "high_heat_areas": ["List areas or zones likely to retain the most heat based on image segmentation colors (e.g., roads, rooftops)"],
            "surface_distribution": {
                "buildings_percent": 0,
                "roads_percent": 0,
                "vegetation_percent": 0,
                "water_bodies_percent": 0
            },
            "risk_level": "high/medium/low"
        },
        "recommendations": {
            "immediate_actions": [
                "Action items such as tree planting, rooftop painting, reducing asphalt coverage"
            ],
            "long_term_actions": [
                "Urban redesign, green roofing, permeable pavements, zoning laws"
            ],
            "estimated_temperature_reduction": "Expected temperature drop in degrees Celsius",
            "implementation_timeline": {
                "immediate": "0-6 months",
                "short_term": "6-12 months",
                "long_term": "1-3 years"
            }
        },
        "sustainability_impact": {
            "environmental_benefits": [
                "Reduced CO2, improved air quality, enhanced biodiversity"
            ],
            "economic_benefits": [
                "Lower cooling costs, increased property value, health cost savings"
           ]
        }
    }
        """
        
        # Generate response from Gemini
        response = model.generate_content(
            [prompt, {'mime_type': 'image/png', 'data': image_b64}],
            generation_config={
                'temperature': 0.7,
                'top_p': 0.8,
                'top_k': 40
            }
        )
        
        # Clean and parse JSON response
        try:
            # Remove markdown formatting if present
            clean_response = response.text.replace('```json\n', '').replace('\n```', '')
            recommendations = json.loads(clean_response)
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            print(f"Raw response: {response.text}")
            recommendations = {
                "error": "Could not parse Gemini response",
                "raw_response": response.text
            }
        
        return recommendations
        
    except Exception as e:
        print(f"Gemini API error: {e}")
        return {
            "error": f"Error analyzing image with Gemini: {str(e)}",
            "recommendations": None
        }

@app.post("/predict/")
async def predict(
    file: UploadFile = File(..., description="Image file to process"),
    analyze: bool = True
):
    """
    Process an image and return both the image data and Gemini recommendations
    """
    try:
        # Validate file exists
        if not file:
            raise HTTPException(status_code=400, detail="No file uploaded")
            
        # Validate file type
        allowed_types = ["image/jpeg", "image/png"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400, 
                detail=f"File type not allowed. Must be one of: {allowed_types}"
            )
        
        # Save uploaded image
        image_path = UPLOAD_DIR / f"{uuid.uuid4()}_{file.filename}"
        try:
            with open(image_path, "wb") as image_file:
                shutil.copyfileobj(file.file, image_file)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")
        
        # Process the image
        result_image_path = process_image(image_path)
        
        if not result_image_path:
            raise HTTPException(status_code=500, detail="Error processing image")
        
        # Get Gemini analysis if requested
        analysis_result = None
        if analyze:
            analysis_result = analyze_uhi_with_gemini(result_image_path)
        
        # Read the processed image into base64
        with open(result_image_path, "rb") as img_file:
            image_data = base64.b64encode(img_file.read()).decode()
        
        # Return both image data and analysis
        return JSONResponse(content={
            "image": {
                "data": image_data,
                "content_type": "image/png",
                "encoding": "base64"
            },
            "analysis": analysis_result,
            "success": True
        })
            
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    finally:
        # Clean up temporary files
        if 'image_path' in locals():
            try:
                os.remove(image_path)
            except:
                pass
        if 'result_image_path' in locals():
            try:
                os.remove(result_image_path)
            except:
                pass

@app.get("/latest-prediction/")
async def get_latest_prediction():
    """
    Return the latest prediction image or the default image if no predictions have been made.
    """
    print("Fetching latest prediction image...")
    if LATEST_PREDICTION_PATH.exists():
        return FileResponse(
            LATEST_PREDICTION_PATH, 
            media_type="image/jpeg", 
            filename="latest_prediction.jpg"
        )
    elif Path("image.png").exists():
        return FileResponse(
            Path("image.png"), 
            media_type="image/png", 
            filename="default_image.png"
        )
    else:
        return JSONResponse(
            status_code=404,
            content={"message": "No prediction available and no default image found"}
        )

@app.get("/health/")
async def health_check():
    """API health check endpoint"""
    return {"status": "healthy", "model_loaded": model is not None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)