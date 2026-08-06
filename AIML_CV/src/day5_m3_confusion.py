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
CSV_PATH = BASE_DIR.parent / "data" / "features_dataset_m3_augmented.csv"
MODEL_PATH = BASE_DIR / "models" / "knn_classifier_m3.joblib"
OUTPUT_PNG = BASE_DIR.parent / "data" / "confusion_matrix_m3.png"

FEATURE_NAMES = (
    [f"tip_wrist_dist_{i}" for i in range(5)] +
    [f"curl_angle_{i}" for i in range(5)] +
    [f"adj_tip_dist_{i}" for i in range(4)]
)

df = pd.read_csv(CSV_PATH)
X = df[FEATURE_NAMES].values
y = df["label"].values

_, X_test, _, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

clf = joblib.load(MODEL_PATH)
y_pred = clf.predict(X_test)

labels = sorted(df["label"].unique())
cm = confusion_matrix(y_test, y_pred, labels=labels)
cm_df = pd.DataFrame(cm, index=labels, columns=labels)

print("Confusion matrix (rows=true, cols=predicted):\n")
print(cm_df)

# Print only the actual misclassifications, readably
print("\nMisclassifications found:")
for true_label in labels:
    row = cm_df.loc[true_label]
    for pred_label in labels:
        if true_label != pred_label and row[pred_label] > 0:
            print(f"  {true_label} -> predicted as {pred_label}: {row[pred_label]} time(s)")

disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=labels)
fig, ax = plt.subplots(figsize=(12, 10))
disp.plot(cmap="Blues", ax=ax, xticks_rotation=45)
plt.title("Confusion Matrix - Full Alphabet (M3)")
plt.tight_layout()
plt.savefig(OUTPUT_PNG)
print(f"\nSaved plot to {OUTPUT_PNG}")
