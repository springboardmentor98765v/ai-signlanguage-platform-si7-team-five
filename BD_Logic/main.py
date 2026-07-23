import os
import pandas as pd
from pydantic import BaseModel
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier

from data_ingestion import load_data
from preprocessing import preprocess
from feature_engineering import feature_engineer
from model_training import train_model
from evaluation import evaluate
from deployment import save_model         

def main():
    print("--- Starting BD Logic ML Pipeline ---")
    
    # Define file paths
    data_path = "postgresql://postgres:VinayBellamkonda@db.ovvvcudvagbnlojfmmnx.supabase.co:5432/postgresql"
    model_path = "model.pkl"

    # Ensure the data file exists before running
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found. Please add it to this directory.")
        return

    # Step 1: Load the Data
    # Returns a pandas DataFrame and prints the loaded data shape
    df = load_data(data_path) 
    
    # Step 2: Preprocess the Data
    # Drops NaN values, isolates the 'target' column, and splits into train/test (80/20)
    print("Preprocessing data...")
    X_train, X_test, y_train, y_test = preprocess(df)
    
    # Step 3: Feature Engineering
    # Fits a StandardScaler on the training data and transforms both train and test sets
    print("Scaling features...")
    X_train_scaled, X_test_scaled = feature_engineer(X_train, X_test)
    
    # Step 4: Train the Model
    # Trains a RandomForestClassifier with 100 estimators 
    print("Training Random Forest model...")
    model = train_model(X_train_scaled, y_train)
    
    # Step 5: Evaluate the Model
    # Predicts on the test set and calculates the accuracy score
    print("Evaluating model...")
    evaluate(model, X_test_scaled, y_test)
    
    # Step 6: Save the Model
    # Dumps the trained model to a pickle file using joblib
    print("Saving model pipeline...")
    save_model(model, path=model_path)
    
    print("--- Pipeline Execution Complete ---")

if __name__ == "__main__":
    main()