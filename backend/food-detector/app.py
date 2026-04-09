import os
import io
import pickle
import numpy as np
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pymongo import MongoClient

from tensorflow.keras.applications.inception_v3 import InceptionV3, preprocess_input
from tensorflow.keras.preprocessing import image as keras_image


@asynccontextmanager
async def lifespan(app: FastAPI):

    print("⏳ Chargement du modèle InceptionV3...")
    app.state.embed_model = InceptionV3(weights="imagenet", include_top=False, pooling="avg")
    print("✅ Modèle InceptionV3 chargé !")

    app.state.mapping_numeric = {
        0: "cheesecake",
        1: "hamburger",
        2: "glace",
        3: "paella",
        4: "pizza",
        5: "spaghetti bolognaise",
        6: "spaghetti carbonara",
        7: "viande rouge",
        8: "tiramisu",
        9: "gauffre"
    }

    try:
        with open("model_orange.pkcls", "rb") as f:
            app.state.orange_model = pickle.load(f)
        print("✅ Modèle Orange chargé avec succès !")
    except Exception as e:
        print(f"❌ Erreur Pickle : {e}")
        app.state.orange_model = None

    # MongoDB
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/healthai")
    try:
        mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        mongo_client.server_info()
        db = mongo_client.get_default_database() or mongo_client["healthai"]
        app.state.predictions_collection = db["predictions"]
        print(f"✅ MongoDB connecté à {MONGO_URI}")
    except Exception as e:
        print(f"❌ Impossible de connecter MongoDB : {e}")
        app.state.predictions_collection = None

    yield


app = FastAPI(
    title="HealthAI - Food Detector API",
    description="Micro-service food detection",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def extract_features(pil_img, embed_model):
    img = pil_img.resize((299, 299))
    img_array = keras_image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    return embed_model.predict(img_array)


@app.post("/predict", tags=["IA"])
async def predict_food(image: UploadFile = File(...)):

    orange_model = app.state.orange_model
    embed_model = app.state.embed_model
    mapping_numeric = app.state.mapping_numeric
    predictions_collection = app.state.predictions_collection

    if not orange_model:
        return {"status": "error", "message": "Le modèle Orange n'est pas chargé."}

    try:
        contents = await image.read()
        pil_img = Image.open(io.BytesIO(contents)).convert("RGB")

        features = extract_features(pil_img, embed_model)

        prediction_tuple = orange_model.predict(features)
        pred_label = int(prediction_tuple[0][0])
        probabilities = prediction_tuple[1]

        pred_index = np.argmax(probabilities)
        pred_confidence = float(probabilities[0][pred_index])

        pred_class_name = mapping_numeric.get(pred_label, "Aliment inconnu")

        # Sauvegarde Mongo
        if predictions_collection is not None:
            try:
                predictions_collection.insert_one({
                    "filename": image.filename,
                    "prediction": pred_class_name,
                    "confidence_percent": float(pred_confidence * 100),
                    "created_at": datetime.utcnow()
                })
            except Exception as e:
                print(f"⚠️ Échec MongoDB : {e}")

        return {
            "status": "success",
            "filename": image.filename,
            "prediction": pred_class_name,
            "confidence_percent": round(pred_confidence * 100, 2)
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}