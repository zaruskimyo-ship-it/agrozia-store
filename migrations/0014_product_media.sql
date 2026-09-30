CREATE TABLE IF NOT EXISTS commerce_product_media (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  media_type TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'gallery',
  storage_key TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL,
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  duration_seconds REAL,
  poster_storage_key TEXT,
  alt_text TEXT,
  title TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,

  FOREIGN KEY (product_id) REFERENCES commerce_products(id) ON DELETE CASCADE,

  CHECK (media_type IN ('image', 'video')),
  CHECK (role IN ('primary', 'gallery', 'packaging', 'application', 'technical')),
  CHECK (status IN ('draft', 'published', 'archived')),
  CHECK (file_size IS NULL OR file_size >= 0),
  CHECK (width IS NULL OR width > 0),
  CHECK (height IS NULL OR height > 0),
  CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
  CHECK (sort_order >= 0)
);

CREATE INDEX IF NOT EXISTS idx_commerce_product_media_product
  ON commerce_product_media(product_id, sort_order, created_at);

CREATE INDEX IF NOT EXISTS idx_commerce_product_media_public
  ON commerce_product_media(product_id, status, media_type, sort_order);