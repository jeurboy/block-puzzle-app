import sys
from PIL import Image

def resize_feature_graphic(input_path, output_path1, output_path2):
    try:
        img = Image.open(input_path)
        
        # 1. Resize width to 1024, height proportional
        width, height = img.size
        ratio = 1024 / width
        new_width = 1024
        new_height = int(height * ratio)
        
        # LANCZOS is high-quality downsampling/upsampling
        img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # 2. Crop the center to exactly 1024x500
        target_width = 1024
        target_height = 500
        
        left = 0
        right = 1024
        top = max(0, (new_height - target_height) / 2)
        bottom = min(new_height, (new_height + target_height) / 2)
        
        cropped_img = img.crop((left, top, right, bottom))
        
        # Save both places
        cropped_img.save(output_path1)
        cropped_img.save(output_path2)
        print(f"Successfully created cropped graphic at {target_width}x{target_height}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    input_file = sys.argv[1]
    output_file_1 = sys.argv[2]
    output_file_2 = sys.argv[3]
    resize_feature_graphic(input_file, output_file_1, output_file_2)
