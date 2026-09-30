function clean(value, maxLength = 1000) {
  if (value == null) return null;
  const text = String(value).trim();
  return text ? text.slice(0, maxLength) : null;
}

function normalizeId(value) {
  const id = clean(value, 200);
  return id || null;
}

function normalizeMediaType(value) {
  return ["image", "video"].includes(value) ? value : null;
}

function normalizeRole(value) {
  return ["primary", "gallery", "packaging", "application", "technical"].includes(value)
    ? value
    : null;
}

function normalizeStatus(value) {
  return ["draft", "published", "archived"].includes(value) ? value : null;
}

function normalizeNonNegativeInteger(value) {
  if (value == null || value === "") return null;
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) return null;
  return number;
}

function normalizePositiveInteger(value) {
  if (value == null || value === "") return null;
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) return null;
  return number;
}

function normalizeNonNegativeNumber(value) {
  if (value == null || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return null;
  return number;
}

function mapMedia(row) {
  if (!row) return null;

  return {
    id: row.id,
    product_id: row.product_id,
    media_type: row.media_type,
    role: row.role,
    storage_key: row.storage_key,
    content_type: row.content_type,
    file_size: row.file_size,
    width: row.width,
    height: row.height,
    duration_seconds: row.duration_seconds,
    poster_storage_key: row.poster_storage_key,
    alt_text: row.alt_text,
    title: row.title,
    sort_order: row.sort_order,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

export function publicProductMedia(row) {
  if (!row) return null;

  return {
    id: row.id,
    media_type: row.media_type,
    role: row.role,
    content_type: row.content_type,
    file_size: row.file_size,
    width: row.width,
    height: row.height,
    duration_seconds: row.duration_seconds,
    alt_text: row.alt_text,
    title: row.title,
    sort_order: row.sort_order,
    url: `/media/${encodeURIComponent(row.id)}`
  };
}

const MEDIA_COLUMNS = `
  id, product_id, media_type, role, storage_key, content_type,
  file_size, width, height, duration_seconds, poster_storage_key,
  alt_text, title, sort_order, status, created_at, updated_at
`;

export async function listProductMedia(db, productId, options = {}) {
  const normalizedProductId = normalizeId(productId);
  if (!normalizedProductId) return [];

  const includeDrafts = options.includeDrafts === true;

  const statement = includeDrafts
    ? db.prepare(`
        SELECT ${MEDIA_COLUMNS}
        FROM commerce_product_media
        WHERE product_id = ?1
        ORDER BY sort_order ASC, created_at ASC
      `).bind(normalizedProductId)
    : db.prepare(`
        SELECT ${MEDIA_COLUMNS}
        FROM commerce_product_media
        WHERE product_id = ?1
          AND status = 'published'
        ORDER BY sort_order ASC, created_at ASC
      `).bind(normalizedProductId);

  const result = await statement.all();
  return (result?.results || []).map(mapMedia);
}


export async function listProductMediaByProductIds(db, productIds = []) {
  if (!db || !Array.isArray(productIds) || productIds.length === 0) return new Map();

  const normalizedIds = [...new Set(
    productIds.map(normalizeId).filter(Boolean)
  )];

  if (normalizedIds.length === 0) return new Map();

  const placeholders = normalizedIds.map((_, index) => `?${index + 1}`).join(", ");

  const result = await db.prepare(`
    SELECT ${MEDIA_COLUMNS}
    FROM commerce_product_media
    WHERE product_id IN (${placeholders})
      AND status = 'published'
    ORDER BY product_id ASC, sort_order ASC, created_at ASC
  `).bind(...normalizedIds).all();

  const grouped = new Map();

  for (const row of result?.results || []) {
    const media = mapMedia(row);
    if (!media) continue;

    const list = grouped.get(media.product_id) || [];
    list.push(media);
    grouped.set(media.product_id, list);
  }

  return grouped;
}
export async function getPublishedProductMediaById(db, id) {
  const normalizedId = normalizeId(id);
  if (!normalizedId) return null;

  const row = await db.prepare(`
    SELECT
      media.id,
      media.product_id,
      media.media_type,
      media.role,
      media.storage_key,
      media.content_type,
      media.file_size,
      media.width,
      media.height,
      media.duration_seconds,
      media.poster_storage_key,
      media.alt_text,
      media.title,
      media.sort_order,
      media.status,
      media.created_at,
      media.updated_at
    FROM commerce_product_media AS media
    INNER JOIN commerce_products AS product
      ON product.id = media.product_id
    WHERE media.id = ?1
      AND media.status = 'published'
      AND product.status = 'published'
    LIMIT 1
  `).bind(normalizedId).first();

  return mapMedia(row);
}

export async function getProductMediaById(db, id) {
  const normalizedId = normalizeId(id);
  if (!normalizedId) return null;

  const row = await db.prepare(`
    SELECT ${MEDIA_COLUMNS}
    FROM commerce_product_media
    WHERE id = ?1
    LIMIT 1
  `).bind(normalizedId).first();

  return mapMedia(row);
}

export async function createProductMedia(db, input = {}) {
  const id = normalizeId(input.id);
  const productId = normalizeId(input.product_id);
  const mediaType = normalizeMediaType(input.media_type);
  const role = normalizeRole(input.role) || "gallery";
  const storageKey = clean(input.storage_key, 1000);
  const contentType = clean(input.content_type, 200);
  const status = normalizeStatus(input.status) || "draft";

  if (!id || !productId || !mediaType || !storageKey || !contentType) {
    return null;
  }

  const fileSize = normalizeNonNegativeInteger(input.file_size);
  const width = normalizePositiveInteger(input.width);
  const height = normalizePositiveInteger(input.height);
  const durationSeconds = normalizeNonNegativeNumber(input.duration_seconds);
  const posterStorageKey = clean(input.poster_storage_key, 1000);
  const altText = clean(input.alt_text, 1000);
  const title = clean(input.title, 500);
  const sortOrder = normalizeNonNegativeInteger(input.sort_order) ?? 0;
  const now = new Date().toISOString();

  await db.prepare(`
    INSERT INTO commerce_product_media (
      id, product_id, media_type, role, storage_key, content_type,
      file_size, width, height, duration_seconds, poster_storage_key,
      alt_text, title, sort_order, status, created_at, updated_at
    ) VALUES (
      ?1, ?2, ?3, ?4, ?5, ?6,
      ?7, ?8, ?9, ?10, ?11,
      ?12, ?13, ?14, ?15, ?16, ?16
    )
  `).bind(
    id,
    productId,
    mediaType,
    role,
    storageKey,
    contentType,
    fileSize,
    width,
    height,
    durationSeconds,
    posterStorageKey,
    altText,
    title,
    sortOrder,
    status,
    now
  ).run();

  return getProductMediaById(db, id);
}

export async function deleteProductMedia(db, id) {
  const normalizedId = normalizeId(id);
  if (!normalizedId) return false;

  const result = await db.prepare(`
    DELETE FROM commerce_product_media
    WHERE id = ?1
  `).bind(normalizedId).run();

  return Boolean(result?.meta?.changes);
}