# Build placeholder extension icons
# Run: python create_icons.py
# This generates simple placeholder icons in the public/icons/ directory.
# Replace with real icons for production.

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, output_path):
    """Create a simple gradient icon with 'MT' text."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Gradient background from blue to purple
    for y in range(size):
        ratio = y / size
        r = int(59 + (26 * (1 - ratio)))
        g = int(130 + (99 * (1 - ratio)))
        b = int(246 + (242 * (1 - ratio)))
        draw.line([(0, y), (size, y)], fill=(r, g, b, 255))

    # Draw a rounded rectangle in the center
    padding = size // 6
    draw.rounded_rectangle(
        [padding, padding, size - padding, size - padding],
        radius=size // 5,
        fill=(255, 255, 255, 200)
    )

    # Draw "MT" text
    try:
        # Try to use a built-in font
        font_size = size // 3
        font = ImageFont.load_default()
    except Exception:
        font = None

    text = "MT"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    x = (size - text_w) // 2
    y = (size - text_h) // 2 - 1
    draw.text((x, y), text, fill=(59, 130, 246, 255), font=font)

    img.save(output_path, 'PNG')
    print(f"Created: {output_path}")


if __name__ == '__main__':
    icon_dir = os.path.join(os.path.dirname(__file__), 'public', 'icons')
    os.makedirs(icon_dir, exist_ok=True)

    for size in [16, 32, 48, 128]:
        path = os.path.join(icon_dir, f'icon{size}.png')
        create_icon(size, path)

    print("All icons created.")
