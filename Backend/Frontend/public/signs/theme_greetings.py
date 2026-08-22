import cv2
import numpy as np
import os
import glob

base_path = r"c:\Users\ASUS\OneDrive\Desktop\sign_language_learning_and_assessment_platform\ai-signlanguage-platform-si7-team-five\Frontend\public\signs"

def get_dominant_hsv(img_path):
    img = cv2.imread(img_path, cv2.IMREAD_UNCHANGED)
    if img is None:
        raise Exception(f"Cannot load {img_path}")
        
    if len(img.shape) == 3 and img.shape[2] == 4:
        mask = img[:, :, 3] > 50
        bgr = img[mask][:, :3]
    else:
        mask = ~((img[:, :, 0] > 240) & (img[:, :, 1] > 240) & (img[:, :, 2] > 240))
        bgr = img[mask]
        
    colors, counts = np.unique(bgr, axis=0, return_counts=True)
    dominant_bgr = colors[np.argmax(counts)]
    
    dominant_bgr_img = np.uint8([[dominant_bgr]])
    hsv = cv2.cvtColor(dominant_bgr_img, cv2.COLOR_BGR2HSV)
    return hsv[0][0]

def standardize_image(img_path, target_hsv, target_v_mean):
    img = cv2.imread(img_path, cv2.IMREAD_UNCHANGED)
    if img is None:
        return False
        
    has_alpha = (len(img.shape) == 3 and img.shape[2] == 4)
    
    if has_alpha:
        bgr = img[:, :, :3]
        alpha = img[:, :, 3]
        mask = alpha > 10
    else:
        bgr = img.copy()
        mask = ~((img[:, :, 0] > 240) & (img[:, :, 1] > 240) & (img[:, :, 2] > 240))
        
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV).astype(np.float32)
    
    color_mask = mask & (hsv[:,:,1] > 10) & (hsv[:,:,2] > 20)
    
    if np.any(color_mask):
        valid_bgr = bgr[color_mask]
        colors, counts = np.unique(valid_bgr, axis=0, return_counts=True)
        if len(colors) > 0:
            dom_bgr = colors[np.argmax(counts)]
            dom_hsv = cv2.cvtColor(np.uint8([[dom_bgr]]), cv2.COLOR_BGR2HSV)[0][0]
            
            v_shift = int(target_hsv[2]) - int(dom_hsv[2])
            
            hsv[color_mask, 0] = target_hsv[0]
            hsv[color_mask, 1] = target_hsv[1]
            
            new_v = hsv[color_mask, 2] + v_shift
            hsv[color_mask, 2] = np.clip(new_v, 0, 255)
            
    hsv = np.clip(hsv, 0, 255).astype(np.uint8)
    new_bgr = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
    
    if has_alpha:
        out = np.dstack((new_bgr, alpha))
    else:
        out = new_bgr
        
    cv2.imwrite(img_path, out)
    return True

if __name__ == "__main__":
    print("Finding target theme from k.png...")
    ref_path = os.path.join(base_path, "k.png")
    
    try:
        t_hsv = get_dominant_hsv(ref_path)
        print(f"Target HSV: {t_hsv}")
        
        greetings = [
            "hello",
            "thank-you",
            "please",
            "goodbye",
            "hello-my-name-is-amala"
        ]
        
        success_count = 0
        for name in greetings:
            ipath = os.path.join(base_path, f"{name}.png")
            if os.path.exists(ipath):
                if standardize_image(ipath, t_hsv, t_hsv[2]):
                    success_count += 1
                else:
                    print(f"Failed to process {ipath}")
            else:
                print(f"File not found: {ipath}")
                    
        print(f"Successfully themed {success_count} greeting images!")
    except Exception as e:
        print(f"Failed: {e}")
