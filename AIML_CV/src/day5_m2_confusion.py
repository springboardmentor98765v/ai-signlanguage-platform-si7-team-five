from pathlib import Path
import numpy as np
import pandas as pd
import joblib
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay
from sklearn.model_selection import train_test_split
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

BASE_DIR = Path(__file__).resolve().parent
CSV_PATH = BASE_DIR.parent / "data" / "features_dataset_augmented.csv"
MODEL_PATH = BASE_DIR / "models" / "knn_classifier_m2.joblib"
OUTPUT_PNG = BASE_DIR.parent / "data" / "confusion_matrix_m2.png"

df = pd.read_csv(CSV_PATH)
feature_cols = [c for c in df.columns if c not in ("filename", "label", "source")]

X = df[feature_cols].values
y = df["label"].values

_, X_test, _, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

clf = joblib.load(MODEL_PATH)
y_pred = clf.predict(X_test)

labels = sorted(df["label"].unique())
cm = confusion_matrix(y_test, y_pred, labels=labels)

print("Confusion matrix (rows=true, cols=predicted):")
print(pd.DataFrame(cm, index=labels, columns=labels))

disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=labels)
disp.plot(cmap="Blues")
plt.title("Confusion Matrix (same-source split - see caveat in model card)")
plt.savefig(OUTPUT_PNG)
print(f"\nSaved plot to {OUTPUT_PNG}")

print("""
NOTE: This matrix is computed on a same-source train/test split (see Day 4 caveat)
and currently shows 100% accuracy for all classes -- it does NOT reveal real
per-letter weaknesses yet. Based on Day 3's centroid-distance analysis, C and Y
had the smallest inter-class distance (60.25 vs 126-293 for all other pairs),
making them the current best candidate for a 'weak pair' once real varied
data is available to test against.
""")
