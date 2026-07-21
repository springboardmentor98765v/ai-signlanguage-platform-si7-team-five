from pathlib import Path
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, classification_report

BASE_DIR = Path(__file__).resolve().parent
CSV_PATH = BASE_DIR.parent / "data" / "features_dataset_augmented.csv"
MODEL_OUT = BASE_DIR / "models" / "knn_classifier_m2.joblib"

df = pd.read_csv(CSV_PATH)
feature_cols = [c for c in df.columns if c not in ("filename", "label", "source")]

X = df[feature_cols].values
y = df["label"].values

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y
)

print(f"Train samples: {len(X_train)}, Test samples: {len(X_test)}")

clf = KNeighborsClassifier(n_neighbors=5)
clf.fit(X_train, y_train)

y_pred = clf.predict(X_test)
acc = accuracy_score(y_test, y_pred)

print(f"\nTest-set accuracy: {acc * 100:.1f}%")
print(f"\nClassification report:\n{classification_report(y_test, y_pred)}")

MODEL_OUT.parent.mkdir(exist_ok=True)
joblib.dump(clf, MODEL_OUT)
print(f"Model saved to {MODEL_OUT}")
