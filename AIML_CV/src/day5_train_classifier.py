import pandas as pd
import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score
import joblib
import os

DATASET_PATH = "data/features_dataset.csv"
MODEL_OUT = "models/knn_classifier.joblib"

df = pd.read_csv(DATASET_PATH)
print(f"Loaded dataset: {len(df)} samples, {df['label'].nunique()} classes")
print(df['label'].value_counts())

feature_cols = [c for c in df.columns if c not in ("filename", "label")]
X = df[feature_cols].values
y = df["label"].values

min_class_count = df['label'].value_counts().min()

if min_class_count < 2:
    print("\n[NOTE] Each class has only 1 sample -- a real train/test split isn't possible")
    print("(holding out the only example of a class leaves nothing to train on for it).")
    print("Training on all samples and reporting TRAINING-FIT accuracy as a pipeline")
    print("sanity check, not a generalization metric. This is expected for Milestone 1")
    print("per the SRS: 'does not require production-grade accuracy.'\n")

    knn = KNeighborsClassifier(n_neighbors=1)
    knn.fit(X, y)

    preds = knn.predict(X)
    acc = accuracy_score(y, preds)
    print(f"Training-fit accuracy: {acc * 100:.1f}% (expected to be 100% -- memorization, not generalization)")

else:
    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    knn = KNeighborsClassifier(n_neighbors=min(3, min_class_count))
    knn.fit(X_train, y_train)
    preds = knn.predict(X_test)
    acc = accuracy_score(y_test, preds)
    print(f"\nHold-out test accuracy: {acc * 100:.1f}%")

os.makedirs("models", exist_ok=True)
joblib.dump(knn, MODEL_OUT)
print(f"\nModel saved to {MODEL_OUT}")

# Quick sanity check: predict on each training sample individually
print("\nSanity check -- predictions on training data:")
for i, row in df.iterrows():
    pred = knn.predict([X[i]])[0]
    match = "OK" if pred == y[i] else "MISMATCH"
    print(f"  {row['filename']}: true={row['label']}, predicted={pred} [{match}]")
