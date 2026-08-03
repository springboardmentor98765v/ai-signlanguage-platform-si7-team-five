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
