from PIL import Image
import os

def remove_black_background(filepath):
    print(f"Processing {filepath}")
    img = Image.open(filepath).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        r, g, b, a = item
        # Calculate brightness (luminance)
        luminance = (r * 299 + g * 587 + b * 114) / 1000
        
        # If the pixel is very dark (close to black), make it transparent
        if luminance < 30:
            # Fully transparent
            new_data.append((r, g, b, 0))
        elif luminance < 80:
            # Soft edge / anti-aliasing transparency
            # Map luminance [30, 80] -> alpha [0, 255]
            alpha = int((luminance - 30) * (255 / 50))
            new_data.append((r, g, b, alpha))
        else:
            new_data.append((r, g, b, a))
            
    img.putdata(new_data)
    img.save(filepath, "PNG")
    print(f"Saved {filepath}")

if __name__ == "__main__":
    files = [
        "peace_3d_glass.png",
        "i_love_you_3d_glass.png",
        "thumbs_up_3d_glass.png"
    ]
    
    base_dir = r"c:\Users\ASUS\OneDrive\Desktop\sign_language_learning_and_assessment_platform\ai-signlanguage-platform-si7-team-five\Frontend\public\signs"
    
    for filename in files:
        path = os.path.join(base_dir, filename)
        if os.path.exists(path):
            remove_black_background(path)
        else:
            print(f"File not found: {path}")
