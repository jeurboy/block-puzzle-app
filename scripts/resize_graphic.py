from PIL import Image

input_path = "/Users/pornprasithmahasith/.gemini/antigravity/brain/f25937e5-3b76-40f0-9f96-239d6a338118/play_feature_graphic_text_1774275758395.png"
output_path = "/Volumes/Dock/Documents/workspace-dock/block-puzzle/block-puzzle-app/assets/images/feature_graphic.png"

img = Image.open(input_path)
target_aspect = 1024 / 500
current_aspect = img.width / img.height

# Crop to 1024:500 aspect ratio from the center
if current_aspect > target_aspect:
    new_width = int(target_aspect * img.height)
    left = (img.width - new_width) / 2
    right = left + new_width
    top = 0
    bottom = img.height
else:
    new_height = int(img.width / target_aspect)
    top = (img.height - new_height) / 2
    bottom = top + new_height
    left = 0
    right = img.width

img_cropped = img.crop((left, top, right, bottom))
img_resized = img_cropped.resize((1024, 500), Image.Resampling.LANCZOS)
img_resized.save(output_path)
print("Saved to", output_path)
