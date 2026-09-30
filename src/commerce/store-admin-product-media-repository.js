import {
  listProductMedia,
  getProductMediaById,
  createProductMedia,
  deleteProductMedia
} from "./product-media-repository.js";

function normalizeId(value) {
  const id = String(value ?? "").trim();
  return id || null;
}

const ALLOWED_ROLES = new Set([
  "primary",
  "gallery",
  "packaging",
  "application",
  "technical"
]);

const ALLOWED_STATUS = new Set([
  "draft",
  "published",
  "archived"
]);

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif"
]);

const VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm"
]);

export const MEDIA_LIMITS = Object.freeze({
  image: 12 * 1024 * 1024,
  video: 32 * 1024 * 1024
});

export function validateMediaUpload(file) {
  if (!file || typeof file.arrayBuffer !== "function") {
    throw new Error("invalid_media_file");
  }

  const contentType = String(file.type || "").toLowerCase().trim();
  const size = Number(file.size);

  if (!Number.isInteger(size) || size <= 0) {
    throw new Error("invalid_media_file_size");
  }

  let mediaType;

  if (IMAGE_TYPES.has(contentType)) {
    mediaType = "image";
  } else if (VIDEO_TYPES.has(contentType)) {
    mediaType = "video";
  } else {
    throw new Error("unsupported_media_type");
  }

  if (size > MEDIA_LIMITS[mediaType]) {
    throw new Error(
      mediaType === "image"
        ? "image_file_too_large"
        : "video_file_too_large"
    );
  }

  return {
    mediaType,
    contentType,
    size
  };
}

export function validateMediaMetadata(input = {}) {
  const role = String(input.role ?? "gallery").trim().toLowerCase();
  const status = String(input.status ?? "draft").trim().toLowerCase();

  if (!ALLOWED_ROLES.has(role)) {
    throw new Error("invalid_media_role");
  }

  if (!ALLOWED_STATUS.has(status)) {
    throw new Error("invalid_media_status");
  }

  const sortOrder = Number(input.sort_order ?? 0);

  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    throw new Error("invalid_media_sort_order");
  }

  const altText = input.alt_text == null
    ? null
    : String(input.alt_text).trim().slice(0, 500);

  const title = input.title == null
    ? null
    : String(input.title).trim().slice(0, 200);

  return {
    role,
    status,
    sort_order: sortOrder,
    alt_text: altText || null,
    title: title || null
  };
}

export async function listAdminProductMedia(db, productId) {
  const normalized = normalizeId(productId);
  if (!normalized) return [];

  return listProductMedia(db, normalized, { includeDrafts: true });
}

export async function getAdminProductMedia(db, mediaId) {
  const normalized = normalizeId(mediaId);
  if (!normalized) return null;

  return getProductMediaById(db, normalized);
}

export async function createAdminProductMedia(db, input) {
  const productId = normalizeId(input?.product_id);

  if (!productId) {
    throw new Error("invalid_product_id");
  }

  const metadata = validateMediaMetadata(input);
  const id = normalizeId(input?.id) || crypto.randomUUID();

  return createProductMedia(db, {
    ...input,
    id,
    product_id: productId,
    ...metadata
  });
}

export async function deleteAdminProductMedia(db, mediaId) {
  const normalized = normalizeId(mediaId);
  if (!normalized) return null;

  return deleteProductMedia(db, normalized);
}