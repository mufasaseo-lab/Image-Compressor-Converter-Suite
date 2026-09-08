# Image Compressor & Converter Suite

A browser-based image processing toolkit for compressing, resizing, converting, cropping, rotating, and watermarking images. All processing runs locally in the browser using the HTML Canvas API.

## Features

- Upload JPG, PNG, and WebP images
- Drag-and-drop image upload
- Compress images with adjustable quality
- Resize images with aspect-ratio control
- Convert images between JPG, PNG, and WebP
- Crop images using position and size controls
- Rotate images by 90, 180, or 270 degrees
- Add customizable text watermarks
- Resize images for social media platforms
- Preview original image details and processed output details
- Download processed images locally
- No backend or external dependency required

## Social Media Presets

The social media resizer includes presets for:

- Facebook Post
- Facebook Cover
- Instagram Square
- Instagram Story
- YouTube Thumbnail
- LinkedIn Post
- LinkedIn Banner
- X / Twitter Post
- Pinterest Pin

## Getting Started

1. Download or clone this repository.
2. Open `Image Compressor & Converter Suite.html` in a modern web browser.
3. Upload an image or drag and drop it into the upload area.
4. Select a tool from the sidebar.
5. Adjust the available settings.
6. Click **Process Image**.
7. Click **Download Image** to save the result.

No installation, build step, or server is required.

## Project Structure

```text
Image Compressor & Converter Suite/
├── Image Compressor & Converter Suite.html
├── HISTORY.md
└── README.md
```

## Privacy

Images are processed in the browser and are not uploaded to a server by this application.

## Browser Support

Use a modern browser with support for:

- HTML Canvas
- `canvas.toBlob()`
- Object URLs
- Drag-and-drop file input

## Testing Status

The following runtime flows have been tested successfully:

- Page rendering
- Image upload and preview
- Compression
- Resize
- JPG, PNG, and WebP conversion
- Crop
- Rotate
- Watermark
- Social media resizing
- Output generation
- Image download
- Reset workflow

See [HISTORY.md](HISTORY.md) for the project review and runtime test record.

## License

No license has been specified for this project yet.
