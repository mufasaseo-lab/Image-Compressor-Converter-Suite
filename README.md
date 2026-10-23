# Image Compressor & Converter Suite

A browser-based image processing toolkit for compressing, resizing, converting, cropping, rotating, and watermarking images. All processing runs locally in the browser using the HTML Canvas API.

## Features

- Upload JPG, PNG, WebP, and browser-supported AVIF images
- Upload or drag and drop one image or a multi-file batch
- Compress images with adjustable quality
- Use Balanced, Maximum compression, or Best quality smart compression modes
- Resize images with aspect-ratio control
- Convert images between JPG, PNG, and WebP
- Crop images with synchronized numeric controls and a draggable visual selection
- Rotate images by 90, 180, or 270 degrees
- Add customizable text watermarks
- Resize images for social media platforms
- Preview original and processed images side by side
- See a live processed preview and output-size reduction estimate while changing compression and resize settings
- Inspect before/after results with a mouse-, touch-, and keyboard-accessible comparison slider
- Optionally target a file size for JPEG and WebP without silently changing dimensions or format
- View honest output format, dimensions, size, and size increase/reduction details
- Process batch queues sequentially with per-file status and failure isolation
- Download individual results or all successful batch results as a locally generated ZIP
- Track batch progress with a visual progress bar
- Paste images directly from the clipboard and switch between light and dark themes
- Warn about source dimensions, file size, estimated Canvas memory, and browser encoder fallback
- No backend or external dependency required

## Social Media Presets

The social media resizer includes presets for:

- Facebook Post
- Facebook Cover
- Instagram Square
- Instagram Portrait
- Instagram Story
- Facebook / Instagram Portrait
- WhatsApp Status
- YouTube Thumbnail
- LinkedIn Post
- LinkedIn Banner
- X / Twitter Post
- Pinterest Pin
- Square Product Image

## Getting Started

1. Download or clone this repository.
2. Open `Image Compressor & Converter Suite.html` in a modern web browser.
3. Upload one or more images, or drag and drop them into the upload area.
4. Select a tool from the sidebar.
5. Adjust the available settings.
6. For one image, click **Process Image**. For multiple images, click **Process Queue**.
7. Inspect the output preview and metadata.
8. Download one result, or download all successful batch outputs as a ZIP.

No installation, build step, or server is required.

## Batch Processing

Batch files use the tool and settings selected when processing begins. Inputs are decoded and processed sequentially rather than all at once. A failed file is reported in its queue row and does not stop later files. Successful output blobs remain in browser memory until the queue is replaced, reset, or the page is closed.

The ZIP writer is implemented locally in the application and uses uncompressed ZIP entries. No CDN, package, upload, or network request is involved. Very large batches can still be limited by available browser memory and the ZIP32 4 GB size limit.

## Target File Size

The optional KB target applies only to JPEG and WebP. The app tests encoded Blob sizes and searches for the highest tested quality within the target. If 10% quality is still too large, it reports that the target cannot be reached without changing dimensions. It never silently resizes the image or changes the selected format. PNG targets are not claimed because the Canvas PNG encoder does not provide dependable size control through its quality argument.

## Large-Image Safety

The app checks source file size, decoded pixel dimensions, and estimated working Canvas memory. It warns for unusually large inputs and blocks dimensions considered likely to exceed practical Canvas limits. Browser limits vary, so a warning does not guarantee that every device can process the image.

## Project Structure

```text
Image Compressor & Converter Suite/
├── Image Compressor & Converter Suite.html
├── HISTORY.md
├── PRIVACY_POLICY.md
├── README.md
└── verify.mjs
```

Run the dependency-free verification script with:

```bash
node verify.mjs
```

It compiles the inline JavaScript, checks DOM ID integrity, validates the CRC-32/ZIP writer, exercises reachable/unreachable/PNG target-size branches, and checks crop bounds and locked-ratio calculations.

## Privacy

Images are processed in the browser and are not uploaded to a server by this application.

## Browser Support

Use a modern browser with support for:

- HTML Canvas
- `canvas.toBlob()`
- Object URLs
- Drag-and-drop file input
- Pointer Events for visual crop interaction
- `TextEncoder` and typed arrays for local ZIP generation

## Testing Status

The initial version recorded successful manual browser testing for:

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

The 2026-09-23 enhancement added static syntax/DOM verification and deterministic checks for the target-size and ZIP logic. An in-app browser was not available in that development session, so the expanded single-image, crop, comparison, and batch UI still requires a manual browser regression pass.

See [HISTORY.md](HISTORY.md) for the project review and runtime test record.

## License

No license has been specified for this project yet.
