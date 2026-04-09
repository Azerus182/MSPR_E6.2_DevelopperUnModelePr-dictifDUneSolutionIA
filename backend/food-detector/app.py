from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import numpy as np
import pickle

from tensorflow.keras.applications.inception_v3 import InceptionV3, preprocess_input
from tensorflow.keras.preprocessing import image as keras_image

@asynccontextmanager
async def lifespan(app: FastAPI):
    embed_model = InceptionV3(weights='imagenet', include_top=False, pooling='avg')
    mapping_numeric = {
        0: 'cheesecake',
        1: 'hamburger',
        2: 'glace',
        3: 'paella',
        4: 'pizza',
        5: 'spaghetti bolognaise',
        6: 'spaghetti carbonara',
        7: 'viande rouge',
        8: 'tiramisu',
        9: 'gauffre'
    }
    try:
        with open("model_orange.pkcls", "rb") as f:
            orange_model = pickle.load(f)
        print("✅ Modèle Orange chargé avec succès !")
    except Exception as e:
        print(f"❌ Erreur Pickle : {e}")
        orange_model = None
    yield


app = FastAPI(
    title="HealthAI - Food Detector API",
    description="Micro-service food detection",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



def extract_features(pil_img):
    img = pil_img.resize((299, 299))
    img_array = keras_image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    return embed_model.predict(img_array)

@app.post("/predict", tags=["IA"])
async def predict_food(image: UploadFile = File(...)):
    if not orange_model:
        return {"error": "Le modèle Orange n'est pas chargé."}
    try:
        contents = await image.read()
        pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
        features = extract_features(pil_img)
        prediction_tuple = orange_model.predict(features)
        pred_label = int(prediction_tuple[0][0])
        probabilities = prediction_tuple[1]

        pred_index = np.argmax(probabilities)
        pred_confidence = float(probabilities[0][pred_index])

        pred_class_name = mapping_numeric.get(pred_label, "Aliment inconnu")

        return {
            "status": "success",
            "filename": image.filename,
            "prediction": pred_class_name,
            "confidence_percent": round(pred_confidence * 100, 2)
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}