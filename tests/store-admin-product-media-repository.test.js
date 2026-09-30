import test from "node:test";
import assert from "node:assert/strict";

import {
  validateMediaUpload,
  validateMediaMetadata,
  MEDIA_LIMITS
} from "../src/commerce/store-admin-product-media-repository.js";

function mockFile(type, size) {
  return {
    type,
    size,
    async arrayBuffer() {
      return new ArrayBuffer(size);
    }
  };
}

test("accepts supported image upload", () => {
  const result = validateMediaUpload(
    mockFile("image/webp", 1024)
  );

  assert.equal(result.mediaType, "image");
  assert.equal(result.contentType, "image/webp");
  assert.equal(result.size, 1024);
});

test("accepts supported video upload", () => {
  const result = validateMediaUpload(
    mockFile("video/mp4", 1024)
  );

  assert.equal(result.mediaType, "video");
  assert.equal(result.contentType, "video/mp4");
});

test("rejects unsupported media type", () => {
  assert.throws(
    () => validateMediaUpload(
      mockFile("application/pdf", 1024)
    ),
    /unsupported_media_type/
  );
});

test("rejects oversized image", () => {
  assert.throws(
    () => validateMediaUpload(
      mockFile("image/jpeg", MEDIA_LIMITS.image + 1)
    ),
    /image_file_too_large/
  );
});

test("rejects oversized video", () => {
  assert.throws(
    () => validateMediaUpload(
      mockFile("video/mp4", MEDIA_LIMITS.video + 1)
    ),
    /video_file_too_large/
  );
});

test("validates media metadata", () => {
  const result = validateMediaMetadata({
    role: "application",
    status: "published",
    sort_order: 4,
    alt_text: "Greenhouse application",
    title: "Application"
  });

  assert.deepEqual(result, {
    role: "application",
    status: "published",
    sort_order: 4,
    alt_text: "Greenhouse application",
    title: "Application"
  });
});

test("rejects invalid media role", () => {
  assert.throws(
    () => validateMediaMetadata({
      role: "unknown"
    }),
    /invalid_media_role/
  );
});

test("rejects invalid media status", () => {
  assert.throws(
    () => validateMediaMetadata({
      status: "live"
    }),
    /invalid_media_status/
  );
});

test("rejects negative sort order", () => {
  assert.throws(
    () => validateMediaMetadata({
      sort_order: -1
    }),
    /invalid_media_sort_order/
  );
});