# Project History

This document records the repository history, current architecture, implemented behavior, verification status, and known limitations of **Image Compressor & Converter Suite**.

## Current Project Baseline

- The repository contains a standalone, browser-based image-processing application.
- The complete application is implemented in `Image Compressor & Converter Suite.html` as one embeddable HTML fragment containing scoped CSS, markup, and vanilla JavaScript.
- There is no package manager, build step, framework, backend, database, external API, or runtime dependency.
- Image decoding, drawing, transformation, encoding, preview URLs, and downloads use browser-native APIs: `Image`, HTML Canvas, `canvas.toBlob()`, `Blob`, and `URL.createObjectURL()`.
- Images remain in the browser; the application code does not upload them or use cookies, analytics, or persistent storage.
- Supporting documentation is provided in `README.md`, `PRIVACY_POLICY.md`, and this file.

## Repository Timeline

### 2026-10-23 - SaaS UI and Workflow Upgrade

- Refreshed the visual system with responsive SaaS-style cards, compact tool navigation, improved form controls, overflow guards, and light/dark theme support.
- Added smart compression modes: Balanced, Maximum compression, and Best quality.
- Added debounced live processing previews and output-size reduction estimates for compression and resize settings.
- Added browser-supported AVIF upload/export detection while retaining an honest encoder fallback when a browser does not support AVIF.
- Added clipboard image paste through the Clipboard API and normal paste events.
- Added a visual batch progress bar and preserved sequential processing, isolated failures, and ZIP downloads.
- Added an automatic JPEG/WebP fallback for compressor mode when the selected settings would otherwise produce an output larger than the source.
- Updated README and verification coverage remained green: JavaScript syntax, DOM ID integrity, ZIP checksums, encoder branches, target-size branches, and crop calculations.

### 2026-09-23 — Preview, Batch, Crop, Target-Size, and Safety Expansion

- Added labeled original/processed previews with filename, verified format, dimensions, file size, and an honest smaller/larger difference.
- Added an accessible before/after range comparison that supports pointer, touch, and keyboard input while retaining side-by-side previews as a clear fallback for different image shapes.
- Added multi-file selection and drag/drop, a per-file status queue, sequential processing, isolated errors, individual downloads, cancellation, and download-all ZIP generation.
- Implemented a dependency-free local ZIP32 store writer with CRC-32 checksums; no CDN or network requirement was introduced.
- Added a draggable and resizable visual crop rectangle synchronized with bounded percentage inputs, keyboard movement/resizing, responsive preview scaling, and optional crop ratios.
- Added optional target-size search for JPEG and WebP. Actual Blob sizes are tested, unreachable targets are reported, and neither dimensions nor format are silently changed. PNG displays an explicit unsupported-target explanation.
- Added Instagram Portrait, Facebook / Instagram Portrait, WhatsApp Status, and Square Product Image presets while retaining all original presets.
- Added source file, decoded dimension, estimated Canvas memory, missing context, encoder failure, and actual output MIME safeguards.
- Preserved transparent unused space for PNG/WebP social `contain` output while keeping the selected solid background for JPEG.
- Added operation-version guards so reset, replacement, tool change, or cancellation prevents stale asynchronous results from being shown.
- Expanded keyboard focus styling and live status announcements.
- Updated README, privacy documentation, and project history for the new behavior.
- Verification completed in this change:
  - Inline JavaScript parses successfully.
  - All 97 HTML IDs are unique.
  - All 93 JavaScript ID selectors resolve to markup elements.
  - Added `verify.mjs`, a dependency-free deterministic verification script.
  - CRC-32 known vector, two-entry ZIP structure, reachable/unreachable/PNG target branches, and crop bound/ratio checks pass.
  - Git whitespace validation passes.
  - The in-app browser was unavailable, so the expanded interactive flows were not claimed as browser-tested in this session.

### 2026-09-23 — Complete Code and History Review

- Read the full application source, all supporting Markdown files, and the available Git history.
- Documented the actual UI structure, processing pipeline, tool-specific behavior, responsive layout, state lifecycle, validation, export naming, and download workflow.
- Confirmed that the application exposes 11 image tool modes and 9 social-media presets.
- Replaced the short initial history with this complete technical baseline for future additions.
- Performed static integrity checks:
  - Inline JavaScript parses successfully.
  - All 74 HTML IDs are unique.
  - All 72 unique ID selectors referenced by JavaScript resolve to elements in the markup.
  - The working tree was clean before this documentation update.
- No application code or user-facing behavior was changed during this review.

### 2026-09-08 — Initial Repository Version

- Git commit `a518f1c` (`Initial image compressor suite project`) added the complete initial repository.
- Added the standalone application, README, privacy policy, and initial project history.
- The initial history records successful manual runtime testing of rendering, upload, preview, every processing tool, output metadata, download, and reset, with no console or page errors observed at that time.

## Application Structure

### Presentation Layer

- All selectors are scoped beneath `#gg-image-tools-app` to reduce conflicts when the component is embedded in another page.
- The visual design uses CSS custom properties, gradients, translucent panels, rounded cards, shadows, and a cyan/blue accent palette.
- The primary layout contains a top bar, hero and upload workspace, sticky tool sidebar, dynamic controls panel, result summary, and fixed toast notification.
- Responsive breakpoints are defined at 1024 px and 760 px. The two-column layouts collapse first, followed by controls, metadata, presets, and actions becoming single-column on small screens.
- The source is an HTML fragment rather than a full document with `<!doctype>`, `<html>`, `<head>`, and `<body>` wrappers. Browsers can still open it directly, and it can also be embedded in an existing page.

### State and Control Layer

The in-memory `state` object tracks:

- Uploaded `File` and decoded `Image` objects
- Original object URL and source dimensions
- Active tool
- Generated result `Blob`, filename, and object URL
- Selected social-media preset
- Batch queue, operation version, and cancellation/restoration state

`toolMeta` supplies each tool's title, description, badge, instruction, and tip. `setActiveTool()` updates that copy and shows only the controls relevant to the selected mode.

### Processing Pipeline

1. The user selects or drops one or more JPG, PNG, or WebP images.
2. `handleFile()` validates the MIME type, creates an object URL, decodes the image, stores its dimensions, and updates the original preview and file metadata.
3. `processImage()` reads the active tool and its controls, creates a correctly sized canvas, draws the transformed image, and selects the requested MIME type and quality.
4. `canvasToBlob()` encodes the canvas asynchronously.
5. `setOutput()` creates the result object URL and displays the sanitized output name, verified format, encoded size, actual size difference, dimensions, dual previews, and comparison view.
6. The download action creates a temporary anchor with the `download` attribute and starts a local browser download.
7. Replaced source and result object URLs are revoked. Reset revokes active URLs and clears the current image/result display.

Output filenames use a sanitized source basename plus a tool-specific suffix and MIME-derived extension, for example `photo-compressed.webp` or `photo-instagram-square.jpg`.

## Implemented Tools

| Tool | Processing behavior | Controls / output |
| --- | --- | --- |
| Image Compressor | Redraws at selected dimensions and re-encodes the image | Quality, width, height, aspect-ratio mode, JPG/PNG/WebP output, JPG background |
| Image Resizer | Redraws to custom dimensions | Same controls as compressor; aspect ratio can be preserved or stretched |
| JPG to PNG | Redraws the source and forces PNG output | Full source dimensions; lossless PNG export setting |
| PNG to JPG | Redraws the source over a solid background and forces JPEG | Quality and background color |
| Image to WebP | Redraws the source and forces WebP | Quality control |
| WebP to JPG | Redraws the source over a solid background and forces JPEG | Quality and background color |
| WebP to PNG | Redraws the source and forces PNG | Full source dimensions; lossless PNG export setting |
| Image Cropper | Converts synchronized visual/numeric X, Y, width, and height percentages to source pixels, clamps the crop to source bounds, and draws the selected rectangle | Draggable selection, numeric inputs, optional ratio, JPG/PNG/WebP output, quality |
| Rotate Image | Rotates around the canvas center and swaps canvas dimensions for quarter turns | 90° right, 90° left, 180°, or 270°; format and quality |
| Add Watermark | Draws bold Arial text with configurable opacity, color, position, and a dark outline | Text, five positions, 12–120 px size, 10–100% opacity, output format |
| Social Media Resizer | Draws into a preset canvas using centered `cover` or `contain` fitting | Preset, fit mode, background color, JPG/PNG/WebP output |

The conversion labels describe intended workflows, but source formats are not restricted per conversion tool. Any accepted JPG, PNG, or WebP input can be processed by any tool mode.

## Social Media Presets

| Preset | Dimensions |
| --- | ---: |
| Facebook Post | 1200 × 630 |
| Facebook Cover | 1640 × 924 |
| Instagram Square | 1080 × 1080 |
| Instagram Portrait | 1080 × 1350 |
| Facebook / Instagram Portrait | 1080 × 1350 |
| Instagram Story | 1080 × 1920 |
| WhatsApp Status | 1080 × 1920 |
| YouTube Thumbnail | 1280 × 720 |
| LinkedIn Post | 1200 × 627 |
| LinkedIn Banner | 1584 × 396 |
| X / Twitter Post | 1600 × 900 |
| Pinterest Pin | 1000 × 1500 |
| Square Product Image | 2000 × 2000 |

`cover` fills the complete preset and may crop overflow. `contain` preserves the complete image; unused space uses the selected background for JPEG and remains transparent for PNG/WebP. Separate portrait/story preset names with identical dimensions are retained where the platform-specific labels help users find the intended workflow.

## Input, Output, and Feedback Behavior

- The file picker advertises JPEG/JPG, PNG, and WebP, and JavaScript applies the same MIME allowlist.
- Upload is available through three buttons and drag-and-drop.
- The preview reports original filename, byte size, pixel dimensions, and MIME subtype.
- Processing is blocked until an image is loaded, and the process button shows a loading state while encoding.
- Result metadata reports the generated filename, verified format, new byte size, actual increase/reduction, and output dimensions.
- Toast messages report upload, preset selection, success, reset, validation failures, and processing errors; each toast hides after 3.2 seconds.
- Reset clears the current file, source preview, generated result, and related object URLs. It does not restore every form control or switch the selected tool back to its default.

## Known Behaviors and Limitations

- The main workspace previews one active source image, while multi-file work is represented by the batch queue.
- Batch processing is sequential to limit decoded-image memory, but successful output Blobs remain in memory until the queue is cleared or the page closes.
- The dependency-free ZIP writer stores files without compression and uses ZIP32, so archives are limited to less than 4 GB and 65,535 entries.
- Format validation relies on the browser-provided `File.type` value rather than inspecting file signatures.
- Actual encoding support is browser-dependent. A browser without the requested Canvas export format may fall back or fail.
- Canvas processing generally removes source metadata such as EXIF information and embedded profiles; there is no metadata-preservation feature.
- PNG encoding does not meaningfully use a lossy quality value even where the shared export pipeline supplies one.
- With aspect-ratio locking enabled and both resize dimensions populated, width is authoritative and height is recalculated from the original ratio.
- Crop coordinates remain percentage-based internally and are exposed through numeric inputs plus the visual editor. A selection extending beyond the source edge is clamped.
- Social `contain` mode preserves unused-space transparency for PNG and WebP; JPEG uses the selected solid background.
- Target-size search assumes the encoder's size generally tracks quality and tests eight binary-search iterations after checking the chosen and minimum qualities. Encoder behavior can vary by browser.
- The visual crop editor uses a moveable rectangle with a bottom-right resize handle rather than eight independent edge/corner handles.
- Large-image checks reduce risk but cannot predict every device-specific Canvas or memory limit.
- The repository has a deterministic Node verification script but no full browser automation suite, linter configuration, build pipeline, or continuous-integration workflow.

## Historical Runtime Test Record

The initial project review dated 2026-09-08 recorded successful manual checks for:

- Page rendering
- File selection and drag/drop upload
- Original preview and metadata
- Compression and resizing
- JPG, PNG, and WebP conversions
- Crop, rotation, and watermark generation
- All social-media resize presets
- Output names, formats, dimensions, and download generation
- Reset behavior
- Absence of observed JavaScript console/page errors

The 2026-09-23 review was a complete source and static-integrity review; it did not repeat the historical browser-based runtime test matrix.

## Guidance for Future Changes

- Keep selectors scoped to `#gg-image-tools-app` if the component must remain safe to embed.
- Add new tool metadata, sidebar navigation, controls, processing logic, and reset behavior together so UI and state remain synchronized.
- Revoke any newly introduced object URLs when replaced or reset.
- Update `README.md`, `PRIVACY_POLICY.md`, and this history whenever capabilities, dependencies, supported formats, storage, analytics, networking, or data handling change.
- Add browser-level regression tests if future additions make the processing or state flows more complex.
