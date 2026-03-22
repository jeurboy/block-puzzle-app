from PIL import Image

input_path = "/Users/pornprasithmahasith/.gemini/antigravity/brain/4b98e049-4639-4331-bb3f-598708689c25/play_feature_graphic_1774120631392.png"
output_path = "play_store_feature_graphic.png"

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
