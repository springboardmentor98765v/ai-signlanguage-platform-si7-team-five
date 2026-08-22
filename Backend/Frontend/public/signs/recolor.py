import cv2
import numpy as np
import os
import sys

base_path = r"c:\Users\ASUS\OneDrive\Desktop\sign_language_learning_and_assessment_platform\ai-signlanguage-platform-si7-team-five\Frontend\public\signs"

def get_dominant_color(img_path):
    img = cv2.imread(img_path, cv2.IMREAD_UNCHANGED)
    if img is None:
        print(f"Error loading {img_path}")
        sys.exit(1)
        
    if len(img.shape) == 3 and img.shape[2] == 4:
        mask = img[:, :, 3] > 50
        valid_pixels = img[mask][:, :3]
    else:
        mask = ~((img[:, :, 0] > 240) & (img[:, :, 1] > 240) & (img[:, :, 2] > 240))
        valid_pixels = img[mask]
        
    colors, counts = np.unique(valid_pixels, axis=0, return_counts=True)
    return colors[np.argmax(counts)]

def recolor_image(img_path, target_color):
    img = cv2.imread(img_path, cv2.IMREAD_UNCHANGED)
    if img is None:
        print(f"Failed to load {img_path}")
        return
        
    print(f"Processing {img_path} with target color {target_color}")
    
    if len(img.shape) == 3 and img.shape[2] == 4:
        mask = img[:, :, 3] > 50
        valid_pixels = img[mask][:, :3]
    else:
        mask = ~((img[:, :, 0] > 240) & (img[:, :, 1] > 240) & (img[:, :, 2] > 240))
        valid_pixels = img[mask]
    
    colors, counts = np.unique(valid_pixels, axis=0, return_counts=True)
    dominant_original = colors[np.argmax(counts)]
    
    if len(img.shape) == 3 and img.shape[2] == 4:
        diff = np.abs(img[:, :, :3].astype(int) - dominant_original.astype(int))
    else:
        diff = np.abs(img.astype(int) - dominant_original.astype(int))
        
    color_mask = (np.max(diff, axis=2) < 50) & mask
    
    img[color_mask, 0] = target_color[0]
    img[color_mask, 1] = target_color[1]
    img[color_mask, 2] = target_color[2]
        
    cv2.imwrite(img_path, img)
    print(f"Successfully recolored and saved {img_path}")

if __name__ == "__main__":
    ref_path = os.path.join(base_path, "1.png")
    print("Extracting target color from 1.png...")
    target_bgr = get_dominant_color(ref_path)
    
    recolor_image(os.path.join(base_path, "2.png"), target_bgr)
    recolor_image(os.path.join(base_path, "3.png"), target_bgr)
