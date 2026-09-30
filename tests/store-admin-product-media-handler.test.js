import test from "node:test";
import assert from "node:assert/strict";

import { handleStoreAdminProductMedia } from "../src/commerce/store-admin-product-media-api.js";

function request(method, pathname, options = {}) {
  const headers = new Headers(options.headers || {});

  return new Request(`https://store.test${pathname}`, {
    method,
    headers,
    body: options.body
  });
}

function adminDb(role = "admin", product = null) {
  const mediaRows = new Map();

  return {
    prepare(sql) {
      return {
        bind(...args) {
          return {
            async first() {
              if (sql.includes("commerce_products")) {
                return product;
              }

              if (sql.includes("store_admin_sessions")) {
                return {
                  id: "session-1",
                  admin_id: "admin-1",
                  role,
                  status: "active"
                };
              }

              if (sql.includes("commerce_product_media")) {
                return mediaRows.get(args[0]) ?? null;
              }

              return null;
            },

            async all() {
              if (sql.includes("commerce_product_media")) {
                return {
                  results: Array.from(mediaRows.values())
                };
              }

              return {
                results: []
              };
            },

            async run() {
              if (sql.includes("INSERT INTO commerce_product_media")) {
                const [
                  id,
                  productId,
                  mediaType,
                  mediaRole,
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
                  createdAt
                ] = args;

                mediaRows.set(id, {
                  id,
                  product_id: productId,
                  media_type: mediaType,
                  role: mediaRole,
                  storage_key: storageKey,
                  content_type: contentType,
                  file_size: fileSize,
                  width,
                  height,
                  duration_seconds: durationSeconds,
                  poster_storage_key: posterStorageKey,
                  alt_text: altText,
                  title,
                  sort_order: sortOrder,
                  status,
                  created_at: createdAt,
                  updated_at: createdAt
                });

                return {
                  meta: {
                    changes: 1
                  }
                };
              }

              return {
                meta: {
                  changes: 1
                }
              };
            }
          };
        }
      };
    }
  };
}

function envWith(role, product) {
  const objects = new Map();

  return {
    STORE_DB: adminDb(role, product),

    STORE_ATTACHMENTS: {
      async put(key, value, options) {
        objects.set(key, {
          value,
          options
        });
      },

      async delete(key) {
        objects.delete(key);
      },

      async get(key) {
        const object = objects.get(key);
        return object ? { body: object.value } : null;
      }
    }
  };
}

function multipartRequest(pathname, role, product, file) {
  const form = new FormData();

  form.append("file", file);
  form.append("role", "gallery");
  form.append("status", "draft");
  form.append("sort_order", "0");
  form.append("alt_text", "Test image");
  form.append("title", "Test image");

  return {
    request: request("POST", pathname, {
      headers: {
        cookie: "agz_store_admin_session=test-session"
      },
      body: form
    }),
    env: envWith(role, product)
  };
}

test("GET existing product returns 200", async () => {
  const product = {
    id: "prod-test",
    status: "published"
  };

  const response = await handleStoreAdminProductMedia(
    request("GET", "/api/store-admin/products/prod-test/media", {
      headers: {
        cookie: "agz_store_admin_session=test-session"
      }
    }),
    envWith("admin", product),
    "/api/store-admin/products/prod-test/media"
  );

  assert.equal(response.status, 200);

  const body = await response.json();
  assert.equal(body.ok, true);
});

test("GET unknown product returns 404", async () => {
  const response = await handleStoreAdminProductMedia(
    request("GET", "/api/store-admin/products/does-not-exist/media", {
      headers: {
        cookie: "agz_store_admin_session=test-session"
      }
    }),
    envWith("admin", null),
    "/api/store-admin/products/does-not-exist/media"
  );

  assert.equal(response.status, 404);

  const body = await response.json();
  assert.equal(body.error, "product_not_found");
});

test("POST archived product returns 409", async () => {
  const product = {
    id: "prod-archived",
    status: "archived"
  };

  const file = new File(
    [new Uint8Array([1, 2, 3])],
    "test.webp",
    { type: "image/webp" }
  );

  const { request: req, env } = multipartRequest(
    "/api/store-admin/products/prod-archived/media",
    "admin",
    product,
    file
  );

  const response = await handleStoreAdminProductMedia(
    req,
    env,
    "/api/store-admin/products/prod-archived/media"
  );

  assert.equal(response.status, 409);

  const body = await response.json();
  assert.equal(body.error, "product_archived");
});

test("malformed product URI is rejected without throwing", async () => {
  const pathname = "/api/store-admin/products/%E0%A4%A/media";

  const response = await handleStoreAdminProductMedia(
    request("GET", pathname, {
      headers: {
        cookie: "agz_store_admin_session=test-session"
      }
    }),
    envWith("admin", null),
    pathname
  );

  assert.equal(response, null);
});

test("operator POST returns 403", async () => {
  const product = {
    id: "prod-operator",
    status: "published"
  };

  const file = new File(
    [new Uint8Array([1, 2, 3])],
    "test.webp",
    { type: "image/webp" }
  );

  const { request: req, env } = multipartRequest(
    "/api/store-admin/products/prod-operator/media",
    "operator",
    product,
    file
  );

  const response = await handleStoreAdminProductMedia(
    req,
    env,
    "/api/store-admin/products/prod-operator/media"
  );

  assert.equal(response.status, 403);
});

test("admin invalid MIME returns 400", async () => {
  const product = {
    id: "prod-invalid",
    status: "published"
  };

  const file = new File(
    [new Uint8Array([1, 2, 3])],
    "test.txt",
    { type: "text/plain" }
  );

  const { request: req, env } = multipartRequest(
    "/api/store-admin/products/prod-invalid/media",
    "admin",
    product,
    file
  );

  const response = await handleStoreAdminProductMedia(
    req,
    env,
    "/api/store-admin/products/prod-invalid/media"
  );

  assert.equal(response.status, 400);

  const body = await response.json();
  assert.equal(body.error, "unsupported_media_type");
});

test("manager valid upload returns validated contract", async () => {
  const product = {
    id: "prod-manager",
    status: "published"
  };

  const file = new File(
    [new Uint8Array([1, 2, 3])],
    "test.webp",
    { type: "image/webp" }
  );

  const { request: req, env } = multipartRequest(
    "/api/store-admin/products/prod-manager/media",
    "manager",
    product,
    file
  );

  const response = await handleStoreAdminProductMedia(
    req,
    env,
    "/api/store-admin/products/prod-manager/media"
  );

  assert.equal(response.status, 201);

  const body = await response.json();

  assert.equal(body.ok, true);
  assert.equal(body.media.media_type, "image");
  assert.equal(body.media.content_type, "image/webp");
  assert.equal(body.media.file_size, 3);
  assert.equal(body.media.status, "draft");
  assert.equal(body.media.storage_key, undefined);
});