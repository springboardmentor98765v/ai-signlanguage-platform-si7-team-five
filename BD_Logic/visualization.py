import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns

def plot_dashboard(probs, preds, class_labels, samples_per_row=3):
    n_samples = len(preds)
    n_rows = int(np.ceil(n_samples / samples_per_row))

    fig, axes = plt.subplots(n_rows, samples_per_row, figsize=(samples_per_row*4, n_rows*4))
    axes = axes.flatten()

    for i, (pred, prob) in enumerate(zip(preds, probs)):
        axes[i].bar(class_labels, prob, color='skyblue')
        axes[i].set_title(f"Sample {i} - Predicted: {class_labels[pred]}")
        axes[i].set_ylim(0,1)
        axes[i].set_ylabel("Probability")

    for j in range(i+1, len(axes)):
        axes[j].axis('off')

    plt.tight_layout()
    plt.show()


def plot_summary_heatmap(probs, class_labels):
    """
    Show overall confidence distribution across all samples.
    """
    probs_array = np.array(probs)
    avg_probs = probs_array.mean(axis=0)

    plt.figure(figsize=(6,4))
    sns.heatmap([avg_probs], annot=True, cmap="Blues", xticklabels=class_labels, yticklabels=["Average Confidence"])
    plt.title("Overall Confidence Distribution")
    plt.show()
