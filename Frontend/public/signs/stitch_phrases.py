import cv2
import numpy as np
import os

base_path = r"c:\Users\ASUS\OneDrive\Desktop\sign_language_learning_and_assessment_platform\ai-signlanguage-platform-si7-team-five\Frontend\public\signs"

phrases = {
    "hello": "hello",
    "thank-you": "thankyou",
    "please": "please",
    "goodbye": "goodbye",
    "hello-my-name-is-amala": "helloamala"
}

for out_name, text in phrases.items():
    images = []
    print(f"Generating for {out_name}...")
    for char in text:
        if char == ' ': continue
        path = os.path.join(base_path, f"{char}.png")
        if os.path.exists(path):
            img = cv2.imread(path, cv2.IMREAD_UNCHANGED)
            if img is not None:
                images.append(img)
        else:
            print(f"Missing letter {char} for {out_name}")
    
    if len(images) > 0:
        target_h = 300
        resized = []
        for img in images:
            h, w = img.shape[:2]
            new_w = int(w * (target_h / h))
            res = cv2.resize(img, (new_w, target_h), interpolation=cv2.INTER_AREA)
            
            if len(res.shape) == 3 and res.shape[2] == 3:
                res = cv2.cvtColor(res, cv2.COLOR_BGR2BGRA)
            resized.append(res)
            
        final_img = np.hstack(resized)
        
        out_path = os.path.join(base_path, f"{out_name}.png")
        cv2.imwrite(out_path, final_img)
        print(f"Saved compiled image to {out_path}")
    else:
        print(f"Could not generate {out_name}.")
