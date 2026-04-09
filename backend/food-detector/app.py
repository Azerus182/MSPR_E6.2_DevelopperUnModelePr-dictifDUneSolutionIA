import os
from datetime import datetime

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import numpy as np
import pickle
from pymongo import MongoClient

# Keras & TensorFlow
from tensorflow.keras.applications.inception_v3 import InceptionV3, preprocess_input
from tensorflow.keras.preprocessing import image as keras_image

app = FastAPI(
    title="HealthAI - Food Detector API",
    description="Micro-service IA avec InceptionV3 et Keras.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/healthai")
try:
    mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    mongo_client.server_info()
    db = mongo_client.get_default_database() if mongo_client.get_default_database() else mongo_client["healthai"]
    predictions_collection = db["predictions"]
    print(f"✅ MongoDB connecté à {MONGO_URI}")
except Exception as e:
    print(f"❌ Impossible de connecter MongoDB : {e}")
    predictions_collection = None

# --- 1. CHARGEMENT DES MODÈLES ---
print("⏳ Chargement du modèle d'Embedding (InceptionV3)...")
embed_model = InceptionV3(weights='imagenet', include_top=False, pooling='avg')
print("✅ Modèle d'Embedding prêt !")

print("⏳ Chargement du classifieur Orange (.pkcls)...")
try:
    with open("model_orange.pkcls", "rb") as f:
        orange_model = pickle.load(f)
    print("✅ Modèle Orange chargé avec succès !")
except Exception as e:
    print(f"❌ Erreur Pickle : {e}")
    orange_model = None

# --- MAPPING DU COLLÈGUE ---
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

# --- 2. FONCTION D'EXTRACTION (Adaptée pour l'API) ---
def extract_features(pil_img):
    # On resize directement l'image PIL en 299x299
    img = pil_img.resize((299, 299))
    img_array = keras_image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    return embed_model.predict(img_array)

# --- 3. ENDPOINT API ---
@app.post("/predict", tags=["IA"])
async def predict_food(image: UploadFile = File(...)):
    if not orange_model:
        return {"error": "Le modèle Orange n'est pas chargé."}
        
    try:
        # 1. Lire l'image envoyée par le frontend
        contents = await image.read()
        pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # 2. Extraire les features (InceptionV3)
        features = extract_features(pil_img)
        
        # 3. Prédiction avec le modèle Orange
        prediction_tuple = orange_model.predict(features)
        
        # 4. Logique du collègue pour extraire la probabilité
        pred_label = int(prediction_tuple[0][0])
        probabilities = prediction_tuple[1]
        
        pred_index = np.argmax(probabilities)
        pred_confidence = float(probabilities[0][pred_index]) # Converti en float pour le JSON
        
        # 5. Récupérer le nom du plat via le mapping
        pred_class_name = mapping_numeric.get(pred_label, "Aliment inconnu")
        
        # 6. Enregistrer la prédiction dans MongoDB
        if predictions_collection is not None:
            try:
                predictions_collection.insert_one({
                    "filename": image.filename,
                    "prediction": pred_class_name,
                    "confidence_percent": float(pred_confidence * 100),
                    "created_at": datetime.utcnow()
                })
            except Exception as e:
                print(f"⚠️ Échec de l'enregistrement MongoDB : {e}")

        # 7. Renvoyer la réponse au frontend
        return {
            "status": "success",
            "filename": image.filename,
            "prediction": pred_class_name,
            "confidence_percent": round(pred_confidence * 100, 2)
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e)}