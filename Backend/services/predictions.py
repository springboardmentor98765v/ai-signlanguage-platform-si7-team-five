from typing import List
from fastapi import APIRouter
import numpy as np
import joblib
import os

r = APIRouter()

def load_model():
    model_path = os.path.join(os.path.dirname(__file__), "../../BD_Logic/model.pkl")
    if os.path.exists(model_path):
        return joblib.load(model_path)
    return None

@r.post("/predict")
def predict_with_probabilities(data: List[List[float]]):
    model = load_model()
    if model is None:
        return {"error": "Model not found"}
    
    data_array = np.array(data)
    preds = model.predict(data_array)
    probs = model.predict_proba(data_array)
    return {"predictions": preds.tolist(), "probabilities": probs.tolist()}
