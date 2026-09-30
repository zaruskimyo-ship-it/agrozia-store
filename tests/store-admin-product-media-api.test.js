import test from "node:test";
import assert from "node:assert/strict";

import { sha256Hex } from "../src/auth/admin-session.js";
import { handleStoreAdminProductMedia } from "../src/commerce/store-admin-product-media-api.js";

function mockDb(adminByTokenHash = new Map(), mediaFixture = null) {
  return {
    prepare(sql) {
      return {
        bind(...params) {
          return {
            async first() {
              if (sql.includes("store_admin_sessions")) {
                const tokenHash = params[0];
                return adminByTokenHash.get(tokenHash) ?? null;
              }

              if (sql.includes("commerce_products")) {
                return {
                  id: "prod-1",
                  status: "published"
                };
              }

              if (sql.includes("commerce_product_media")) {
                return mediaFixture ?? {
                  id: params[0],
                  product_id: "prod-1",
                  media_type: "image",
                  role: "gallery",
                  storage_key: "product-media/prod-1/test.webp",
                  content_type: "image/webp",
                  file_size: 10,
                  width: null,
                  height: null,
                  duration_seconds: null,
                  poster_storage_key: null,
                  alt_text: "Test image",
                  title: "Test",
                  sort_order: 0,
                  status: "draft",
                  created_at: "2026-01-01T00:00:00.000Z",
                  updated_at: "2026-01-01T00:00:00.000Z"
                };
              }

              return null;
            },

            async run() {
              return {
                success: true
              };
            },

            async all() {
              return {
                results: []
              };
            }
          };
        }
      };
    }
  };
}

async function requestFor(role, method = "GET") {
  const token = `test-token-${role}`;
  const tokenHash = await sha256Hex(token);

  const admin = {
    id: `admin-${role}`,
    email: `${role}@example.test`,
    name: role,
    role,
    status: "active"
  };

  const request = new Request(
    "https://store.test/api/store-admin/products/prod-1/media",
    {
      method,
      headers: {
        Cookie: `agz_store_admin_session=${encodeURIComponent(token)}`
      }
    }
  );

  return {
    request,
    env: {
      STORE_DB: mockDb(
        new Map([
          [tokenHash, admin]
        ]),
        role === "admin" && method === "POST"
          ? {
              id: "test-admin-video",
              product_id: "prod-1",
              media_type: "video",
              role: "application",
              storage_key: "product-media/prod-1/test-admin-video.mp4",
              content_type: "video/mp4",
              file_size: 10,
              width: null,
              height: null,
              duration_seconds: null,
              poster_storage_key: null,
              alt_text: null,
              title: null,
              sort_order: 2,
              status: "published",
              created_at: "2026-01-01T00:00:00.000Z",
              updated_at: "2026-01-01T00:00:00.000Z"
            }
          : null
      ),
      STORE_ATTACHMENTS: {
        async put() {
          return {};
        },
        async delete() {
          return;
        }
      }
    }
  };
}

test("media API rejects unauthenticated request", async () => {
  const response = await handleStoreAdminProductMedia(
    new Request(
      "https://store.test/api/store-admin/products/prod-1/media"
    ),
    {
      STORE_DB: mockDb()
    },
    "/api/store-admin/products/prod-1/media"
  );

  assert.equal(response.status, 401);

  const data = await response.json();

  assert.equal(data.ok, false);
  assert.equal(data.error, "unauthorized");
});

test("operator can read product media", async () => {
  const { request, env } = await requestFor("operator");

  const response = await handleStoreAdminProductMedia(
    request,
    env,
    "/api/store-admin/products/prod-1/media"
  );

  assert.equal(response.status, 200);

  const data = await response.json();

  assert.equal(data.ok, true);
  assert.deepEqual(data.media, []);
});

test("manager can read product media", async () => {
  const { request, env } = await requestFor("manager");

  const response = await handleStoreAdminProductMedia(
    request,
    env,
    "/api/store-admin/products/prod-1/media"
  );

  assert.equal(response.status, 200);

  const data = await response.json();

  assert.equal(data.ok, true);
});

test("admin can read product media", async () => {
  const { request, env } = await requestFor("admin");

  const response = await handleStoreAdminProductMedia(
    request,
    env,
    "/api/store-admin/products/prod-1/media"
  );

  assert.equal(response.status, 200);

  const data = await response.json();

  assert.equal(data.ok, true);
});

test("operator is forbidden from media mutation", async () => {
  const { request, env } = await requestFor("operator", "POST");

  const response = await handleStoreAdminProductMedia(
    request,
    env,
    "/api/store-admin/products/prod-1/media"
  );

  assert.equal(response.status, 403);

  const data = await response.json();

  assert.equal(data.ok, false);
  assert.equal(data.error, "forbidden");
});

test("manager reaches media upload contract", async () => {
  const { request, env } = await requestFor("manager", "POST");

  const form = new FormData();

  form.append(
    "file",
    new File(
      ["test-image"],
      "test.webp",
      {
        type: "image/webp"
      }
    )
  );

  form.append("role", "gallery");
  form.append("status", "draft");
  form.append("sort_order", "0");
  form.append("alt_text", "Test image");
  form.append("title", "Test");

  const uploadRequest = new Request(request.url, {
    method: "POST",
    headers: {
      Cookie: request.headers.get("Cookie")
    },
    body: form
  });

  const response = await handleStoreAdminProductMedia(
    uploadRequest,
    env,
    "/api/store-admin/products/prod-1/media"
  );

  assert.equal(response.status, 201);

  const data = await response.json();

  assert.equal(data.ok, true);
  assert.equal(data.media.content_type, "image/webp");
  assert.equal(data.media.media_type, "image");
  assert.equal(data.media.role, "gallery");
  assert.equal(data.media.status, "draft");
});

test("admin reaches media upload contract", async () => {
  const { request, env } = await requestFor("admin", "POST");

  const form = new FormData();

  form.append(
    "file",
    new File(
      ["test-video"],
      "test.mp4",
      {
        type: "video/mp4"
      }
    )
  );

  form.append("role", "application");
  form.append("status", "published");
  form.append("sort_order", "2");

  const uploadRequest = new Request(request.url, {
    method: "POST",
    headers: {
      Cookie: request.headers.get("Cookie")
    },
    body: form
  });

  const response = await handleStoreAdminProductMedia(
    uploadRequest,
    env,
    "/api/store-admin/products/prod-1/media"
  );

  assert.equal(response.status, 201);

  const data = await response.json();

  assert.equal(data.ok, true);
  assert.equal(data.media.content_type, "video/mp4");
  assert.equal(data.media.media_type, "video");
  assert.equal(data.media.role, "application");
  assert.equal(data.media.status, "published");
});
