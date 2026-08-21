from PIL import Image

def analyze_img(path):
    print(f"Analyzing {path}")
    try:
        img = Image.open(path).convert("RGBA")
        width, height = img.size
        # get colors where a > 0
        colors = {}
        for y in range(height):
            for x in range(width):
                r, g, b, a = img.getpixel((x, y))
                if a > 50:
                    c = (r, g, b)
                    colors[c] = colors.get(c, 0) + 1
        
        sorted_colors = sorted(colors.items(), key=lambda item: item[1], reverse=True)
        print("Top 5 opaque colors:")
        for color, count in sorted_colors[:5]:
            print(f"Color: {color}, Count: {count}")
    except Exception as e:
        print(f"Error analyzing {path}: {e}")

base_path = r"c:\Users\ASUS\OneDrive\Desktop\sign_language_learning_and_assessment_platform\ai-signlanguage-platform-si7-team-five\Frontend\public\signs"
letters = ['k', 'l', 'm', 'n', 'o']

for l in letters:
    analyze_img(f"{base_path}\\{l}.png")
