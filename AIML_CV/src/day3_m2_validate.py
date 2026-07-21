from pathlib import Path
import pandas as pd
import numpy as np

BASE_DIR = Path(__file__).resolve().parent
CSV_PATH = BASE_DIR.parent / "data" / "features_dataset_augmented.csv"

df = pd.read_csv(CSV_PATH)
feature_cols = [c for c in df.columns if c not in ("filename", "label", "source")]

print(f"Total samples: {len(df)}")
print(f"Classes: {sorted(df['label'].unique())}")
print(f"Samples per class:\n{df['label'].value_counts().sort_index()}\n")

# Check for NaNs / broken rows
nan_count = df[feature_cols].isna().sum().sum()
print(f"NaN values in features: {nan_count}")

# Check per-class feature spread -- augmentation should create some variance, not zero
print("\nPer-class std deviation (avg across features) -- should be > 0, not huge:")
for label in sorted(df['label'].unique()):
    subset = df[df['label'] == label][feature_cols]
    avg_std = subset.std().mean()
    print(f"  {label}: {avg_std:.4f}")

# Check inter-class separation: are class centroids meaningfully different?
print("\nClass centroid distances (pairwise, should be > 0 and reasonably large):")
centroids = df.groupby('label')[feature_cols].mean()
labels = centroids.index.tolist()
for i in range(len(labels)):
    for j in range(i + 1, len(labels)):
        dist = np.linalg.norm(centroids.loc[labels[i]] - centroids.loc[labels[j]])
        print(f"  {labels[i]} <-> {labels[j]}: {dist:.4f}")
