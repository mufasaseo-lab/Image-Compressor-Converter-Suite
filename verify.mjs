import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const html = await readFile(new URL("./Image Compressor & Converter Suite.html", import.meta.url), "utf8");
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
assert(scriptMatch, "Inline script block is missing");
const script = scriptMatch[1];

// Compile the complete application JavaScript without executing browser-only code.
new Function(script);

const ids = [...html.matchAll(/id="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(ids).size, ids.length, "HTML IDs must be unique");
const idReferences = [...script.matchAll(/\$\("#([^"\)]+)"\)/g)].map((match) => match[1]);
const missingIds = [...new Set(idReferences)].filter((id) => !ids.includes(id));
assert.deepEqual(missingIds, [], "Every JavaScript ID selector must resolve to markup");

function sourceBetween(start, end) {
  const startIndex = script.indexOf(start);
  const endIndex = script.indexOf(end, startIndex);
  assert(startIndex >= 0 && endIndex > startIndex, `Could not extract ${start}`);
  return script.slice(startIndex, endIndex);
}

// Verify the exact CRC and ZIP writer implemented in the application.
const zipSource = sourceBetween("const crcTable", "async function downloadQueueZip");
const { crc32, createZip } = new Function(`${zipSource}; return { crc32, createZip };`)();
assert.equal(crc32(new TextEncoder().encode("123456789")), 0xcbf43926, "CRC-32 known vector failed");

const zipBlob = await createZip([
  { name: "first.txt", blob: new Blob(["alpha"], { type: "text/plain" }) },
  { name: "second.txt", blob: new Blob(["beta"], { type: "text/plain" }) }
]);
const zipBytes = new Uint8Array(await zipBlob.arrayBuffer());
const zipView = new DataView(zipBytes.buffer);
assert.equal(zipView.getUint32(0, true), 0x04034b50, "ZIP local header is invalid");
const endOffset = zipBytes.length - 22;
assert.equal(zipView.getUint32(endOffset, true), 0x06054b50, "ZIP end record is invalid");
assert.equal(zipView.getUint16(endOffset + 10, true), 2, "ZIP entry count is invalid");
let localOffset = 0;
const decodedEntries = [];
for (let index = 0; index < 2; index++) {
  assert.equal(zipView.getUint32(localOffset, true), 0x04034b50);
  const expectedCrc = zipView.getUint32(localOffset + 14, true);
  const dataSize = zipView.getUint32(localOffset + 18, true);
  const nameLength = zipView.getUint16(localOffset + 26, true);
  const extraLength = zipView.getUint16(localOffset + 28, true);
  const nameStart = localOffset + 30;
  const dataStart = nameStart + nameLength + extraLength;
  const data = zipBytes.slice(dataStart, dataStart + dataSize);
  assert.equal(crc32(data), expectedCrc, "ZIP entry checksum is invalid");
  decodedEntries.push({ name: new TextDecoder().decode(zipBytes.slice(nameStart, nameStart + nameLength)), data: new TextDecoder().decode(data) });
  localOffset = dataStart + dataSize;
}
assert.deepEqual(decodedEntries, [{ name: "first.txt", data: "alpha" }, { name: "second.txt", data: "beta" }]);

// Verify encoder fallback and null-Blob failures are rejected.
const canvasSource = sourceBetween("function normalizeMime", "async function encodeCanvas");
const { canvasToBlob } = new Function(`${canvasSource}; return { canvasToBlob };`)();
await assert.rejects(
  canvasToBlob({ toBlob(callback) { callback(new Blob(["x"], { type: "image/png" })); } }, "image/jpeg", 0.8),
  /instead of image\/jpeg/
);
await assert.rejects(
  canvasToBlob({ toBlob(callback) { callback(null); } }, "image/jpeg", 0.8),
  /could not encode/
);

// Exercise reachable, unreachable, and unsupported target-size branches.
const targetSource = sourceBetween("async function encodeCanvas", "function loadImageFromFile");
const formatBytes = (bytes) => `${bytes} B`;
const proportionalEncoder = async (_canvas, mime, quality) =>
  new Blob([new Uint8Array(Math.round(200000 * quality))], { type: mime });
const encodeTarget = new Function("canvasToBlob", "formatBytes", `${targetSource}; return encodeCanvas;`)(proportionalEncoder, formatBytes);

const reachable = await encodeTarget({}, "image/jpeg", 0.9, 100);
assert.equal(reachable.targetMet, true);
assert(reachable.blob.size <= 100 * 1024, "Target result exceeds requested bytes");

const oversizedEncoder = async (_canvas, mime, quality) =>
  new Blob([new Uint8Array(160000 + Math.round(1000 * quality))], { type: mime });
const encodeUnreachable = new Function("canvasToBlob", "formatBytes", `${targetSource}; return encodeCanvas;`)(oversizedEncoder, formatBytes);
const unreachable = await encodeUnreachable({}, "image/webp", 0.9, 100);
assert.equal(unreachable.targetMet, false);
assert.match(unreachable.message, /cannot be reached/i);

const pngTarget = await encodeTarget({}, "image/png", 0.9, 100);
assert.equal(pngTarget.targetMet, false);
assert.match(pngTarget.message, /PNG/);

// Verify crop ratio calculations stay inside the source bounds.
const cropSource = sourceBetween("function clamp", "function bindCropEditor");
const cropElements = {
  ggCropX: { value: 10 }, ggCropY: { value: 10 }, ggCropW: { value: 80 }, ggCropH: { value: 80 },
  ggCropRatio: { value: "1" }, ggCropXValue: {}, ggCropYValue: {}, ggCropWValue: {}, ggCropHValue: {},
  ggCropBox: { style: {}, setAttribute() {} }
};
const selectCropElement = (selector) => cropElements[selector.slice(1)];
const cropApi = new Function("$", "state", `${cropSource}; return { getCropValues };`)(selectCropElement, { originalWidth: 4000, originalHeight: 3000 });
const crop = cropApi.getCropValues("width");
assert(crop.x >= 0 && crop.y >= 0 && crop.x + crop.width <= 100 && crop.y + crop.height <= 100);
const pixelRatio = (crop.width * 4000) / (crop.height * 3000);
assert(Math.abs(pixelRatio - 1) < 0.001, "Locked crop ratio is inaccurate");

const report = {
  javascriptSyntax: "pass",
  htmlIds: ids.length,
  uniqueJsIdReferences: new Set(idReferences).size,
  crc32KnownVector: "pass",
  zipEntries: 2,
  zipBytes: zipBytes.length,
  zipPayloadAndChecksums: "pass",
  encoderFallbackAndNullBlob: "pass",
  reachableTargetBytes: reachable.blob.size,
  targetBranches: "pass",
  cropBoundsAndRatio: "pass"
};

console.log(JSON.stringify(report, null, 2));
