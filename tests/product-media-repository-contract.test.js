import assert from "node:assert/strict";
import test from "node:test";

import {
  listProductMedia,
  getProductMediaById,
  createProductMedia,
  deleteProductMedia
} from "../src/commerce/product-media-repository.js";

function makeDb(rows = []) {
  const state = rows.map((row) => ({ ...row }));

  function matchesWhere(row, sql, value) {
    if (sql.includes("WHERE product_id = ?1")) {
      if (row.product_id !== value) return false;
    }

    if (sql.includes("AND status = 'published'")) {
      if (row.status !== "published") return false;
    }

    if (sql.includes("WHERE id = ?1")) {
      if (row.id !== value) return false;
    }

    return true;
  }

  function prepare(sql) {
    let bindings = [];

    return {
      bind(...values) {
        bindings = values;
        return this;
      },

      async all() {
        const value = bindings[0];

        let result = state.filter((row) =>
          matchesWhere(row, sql, value)
        );

        if (sql.includes("ORDER BY sort_order ASC, created_at ASC")) {
          result = [...result].sort((a, b) =>
            a.sort_order - b.sort_order ||
            String(a.created_at).localeCompare(String(b.created_at))
          );
        }

        return { results: result };
      },

      async first() {
        const value = bindings[0];

        return state.find((row) =>
          matchesWhere(row, sql, value)
        ) || null;
      },

      async run() {
        if (sql.includes("INSERT INTO commerce_product_media")) {
          const row = {
            id: bindings[0],
            product_id: bindings[1],
            media_type: bindings[2],
            role: bindings[3],
            storage_key: bindings[4],
            content_type: bindings[5],
            file_size: bindings[6],
            width: bindings[7],
            height: bindings[8],
            duration_seconds: bindings[9],
            poster_storage_key: bindings[10],
            alt_text: bindings[11],
            title: bindings[12],
            sort_order: bindings[13],
            status: bindings[14],
            created_at: bindings[15],
            updated_at: bindings[15]
          };

          state.push(row);
          return { meta: { changes: 1 } };
        }

        if (sql.includes("DELETE FROM commerce_product_media")) {
          const id = bindings[0];
          const before = state.length;

          for (let i = state.length - 1; i >= 0; i--) {
            if (state[i].id === id) {
              state.splice(i, 1);
            }
          }

          return {
            meta: {
              changes: before - state.length
            }
          };
        }

        throw new Error(`Unsupported SQL in test: ${sql}`);
      }
    };
  }

  return {
    prepare,
    state
  };
}

const publishedImage = {
  id: "pm-1",
  product_id: "prod-npk-fertilizer",
  media_type: "image",
  role: "primary",
  storage_key: "product-media/images/prod-npk-fertilizer/pm-1.webp",
  content_type: "image/webp",
  file_size: 1024,
  width: 1200,
  height: 900,
  duration_seconds: null,
  poster_storage_key: null,
  alt_text: "NPK fertilizer",
  title: "NPK primary image",
  sort_order: 0,
  status: "published",
  created_at: "2026-09-27T10:00:00.000Z",
  updated_at: "2026-09-27T10:00:00.000Z"
};

const draftVideo = {
  id: "pm-2",
  product_id: "prod-npk-fertilizer",
  media_type: "video",
  role: "application",
  storage_key: "product-media/videos/prod-npk-fertilizer/pm-2.mp4",
  content_type: "video/mp4",
  file_size: 2048,
  width: 1280,
  height: 720,
  duration_seconds: 45,
  poster_storage_key: "product-media/posters/prod-npk-fertilizer/pm-2.webp",
  alt_text: "NPK application video",
  title: "NPK application",
  sort_order: 1,
  status: "draft",
  created_at: "2026-09-27T10:01:00.000Z",
  updated_at: "2026-09-27T10:01:00.000Z"
};

test("published product media excludes drafts by default", async () => {
  const db = makeDb([publishedImage, draftVideo]);

  const media = await listProductMedia(db, "prod-npk-fertilizer");

  assert.equal(media.length, 1);
  assert.equal(media[0].id, "pm-1");
  assert.equal(media[0].status, "published");
});

test("admin media listing can include drafts", async () => {
  const db = makeDb([publishedImage, draftVideo]);

  const media = await listProductMedia(
    db,
    "prod-npk-fertilizer",
    { includeDrafts: true }
  );

  assert.equal(media.length, 2);
  assert.equal(media[0].id, "pm-1");
  assert.equal(media[1].id, "pm-2");
});

test("media listing preserves sort order", async () => {
  const db = makeDb([
    { ...publishedImage, id: "pm-3", sort_order: 2 },
    { ...publishedImage, id: "pm-1", sort_order: 0 },
    { ...publishedImage, id: "pm-2", sort_order: 1 }
  ]);

  const media = await listProductMedia(db, "prod-npk-fertilizer");

  assert.deepEqual(
    media.map((item) => item.id),
    ["pm-1", "pm-2", "pm-3"]
  );
});

test("createProductMedia persists normalized media metadata", async () => {
  const db = makeDb();

  const media = await createProductMedia(db, {
    id: "pm-new",
    product_id: "prod-npk-fertilizer",
    media_type: "video",
    role: "application",
    storage_key: "product-media/videos/prod-npk-fertilizer/pm-new.mp4",
    content_type: "video/mp4",
    file_size: "4096",
    width: "1280",
    height: "720",
    duration_seconds: "42.5",
    alt_text: "Application video",
    title: "Application",
    sort_order: "3",
    status: "published"
  });

  assert.ok(media);
  assert.equal(media.id, "pm-new");
  assert.equal(media.media_type, "video");
  assert.equal(media.file_size, 4096);
  assert.equal(media.width, 1280);
  assert.equal(media.height, 720);
  assert.equal(media.duration_seconds, 42.5);
  assert.equal(media.sort_order, 3);
  assert.equal(media.status, "published");
});

test("invalid media type is rejected before database write", async () => {
  const db = makeDb();

  const media = await createProductMedia(db, {
    id: "pm-invalid",
    product_id: "prod-npk-fertilizer",
    media_type: "pdf",
    storage_key: "product-media/test.pdf",
    content_type: "application/pdf"
  });

  assert.equal(media, null);
  assert.equal(db.state.length, 0);
});

test("missing storage key is rejected before database write", async () => {
  const db = makeDb();

  const media = await createProductMedia(db, {
    id: "pm-invalid",
    product_id: "prod-npk-fertilizer",
    media_type: "image",
    content_type: "image/webp"
  });

  assert.equal(media, null);
  assert.equal(db.state.length, 0);
});

test("media lookup returns the requested record only", async () => {
  const db = makeDb([publishedImage, draftVideo]);

  const media = await getProductMediaById(db, "pm-2");

  assert.ok(media);
  assert.equal(media.id, "pm-2");
  assert.equal(media.media_type, "video");
});

test("deleteProductMedia removes only the requested media record", async () => {
  const db = makeDb([publishedImage, draftVideo]);

  const deleted = await deleteProductMedia(db, "pm-1");

  assert.equal(deleted, true);
  assert.equal(db.state.length, 1);
  assert.equal(db.state[0].id, "pm-2");
});

test("invalid product media ids are handled safely", async () => {
  const db = makeDb([publishedImage]);

  assert.deepEqual(
    await listProductMedia(db, ""),
    []
  );

  assert.equal(
    await getProductMediaById(db, ""),
    null
  );

  assert.equal(
    await deleteProductMedia(db, ""),
    false
  );
});

console.log("product media repository contract tests: PASS");