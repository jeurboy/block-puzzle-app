import sys
from PIL import Image

def resize_feature_graphic(input_path, output_path1, output_path2):
    try:
        img = Image.open(input_path)
        
        # Original is likely 1024x1024. We want to crop the center 1024x500.
        width, height = img.size
        
        target_width = 1024
        target_height = 500
        
        # Calculate cropping coordinates
        left = max(0, (width - target_width) / 2)
        top = max(0, (height - target_height) / 2)
        right = min(width, (width + target_width) / 2)
        bottom = min(height, (height + target_height) / 2)
        
        # Crop the center
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
