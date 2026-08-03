<<<<<<< HEAD
from data_ingestion import load_data
from preprocessing import preprocess
from feature_engineering import feature_engineer
from model_training import train_model
from evaluation import evaluate
from deployment import save_model

def main():
    # Step 1: Load data
    print("=== Step 1: Data Ingestion ===")
    df = load_data("data.csv")
    
    # Step 2: Preprocessing
    print("\n=== Step 2: Preprocessing ===")
    X_train, X_test, y_train, y_test = preprocess(df)
    print(f"Training set shape: {X_train.shape}")
    print(f"Test set shape: {X_test.shape}")
    
    # Step 3: Feature Engineering
    print("\n=== Step 3: Feature Engineering ===")
    X_train_scaled, X_test_scaled = feature_engineer(X_train, X_test)
    print(f"Scaled training set shape: {X_train_scaled.shape}")
    print(f"Scaled test set shape: {X_test_scaled.shape}")
    
    # Step 4: Model Training
    print("\n=== Step 4: Model Training ===")
    model = train_model(X_train_scaled, y_train)
    print("Model trained successfully")
    
    # Step 5: Evaluation
    print("\n=== Step 5: Evaluation ===")
    accuracy = evaluate(model, X_test_scaled, y_test)
    
    # Step 6: Save Model
    print("\n=== Step 6: Deployment ===")
    save_model(model, "model.pkl")
    
    print("\n=== Pipeline Complete ===")
    print(f"Final Model Accuracy: {accuracy:.2f}")

if __name__ == "__main__":
    main()
=======
import os
import sys

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from fastapi import FastAPI

from BD_Logic.routers.practice_router import router as practice_router
from BD_Logic.routers.assessment_router import router as assessment_router
from BD_Logic.routers.feedback_routers import router as feedback_router
from BD_Logic.routers.analytics_router import router as analytics_router
from BD_Logic.routers.workflow_routers import router as workflow_router
from BD_Logic.assessment.scoring_engine import WeightedScoringEngine
from BD_Logic.feedback.feedback_engine import FeedbackEngine
from BD_Logic.analytics.analytics_engine import AnalyticsEngine
from BD_Logic.recommendation.recommendation_engine import RecommendationEngine
from BD_Logic.api.assessment_api import router as api_router
from BD_Logic.api.analytics_api import router as analytics_api_router
from BD_Logic.api.recommendation_api import router as recommendation_router
from BD_Logic.api.certificate_api import router as certificate_router
from BD_Logic.api.export_api import router as export_router
from BD_Logic.api.report_api import router as report_router
from BD_Logic.database.connection import Base
from BD_Logic.database.connection import engine
from BD_Logic.api.health_check_api import router as health_router
from BD_Logic.middleware.exception_handler import exception_handler as global_exception_handler
from BD_Logic.api.version_api import (
    router as version_router
)

from BD_Logic.deployment.startup import initialize_logger

initialize_logger()


app = FastAPI(
    title="AI Sign Language Platform",
    version="2.0.0"
    
)



Base.metadata.create_all(bind=engine)


app.include_router(practice_router)
app.include_router(feedback_router)
app.include_router(analytics_router)
app.include_router(workflow_router)
app.include_router(assessment_router, prefix="/api/v1")
app.include_router(analytics_api_router, prefix="/api/v1")
app.include_router(recommendation_router, prefix="/api/v1")
app.include_router(api_router, prefix="/api/v1")
app.include_router(report_router, prefix="/api/v1")
app.include_router(certificate_router, prefix="/api/v1")
app.include_router(health_router, prefix="/api/v1")
app.add_exception_handler(Exception, global_exception_handler)
app.include_router(version_router, prefix="/api/v1")
>>>>>>> 21c5eb5b19ee300388e8637d0a490c6f68cf9a2c
