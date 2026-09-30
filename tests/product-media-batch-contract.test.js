import assert from "node:assert/strict";
import test from "node:test";

import {
  listProductMediaByProductIds
} from "../src/commerce/product-media-repository.js";

function makeDb(rows = []) {
  const calls = [];

  function prepare(sql) {
    let bindings = [];

    return {
      bind(...values) {
        bindings = values;
        return this;
      },

      async all() {
        calls.push({
          sql,
          bindings: [...bindings]
        });

        if (!sql.includes("FROM commerce_product_media")) {
          throw new Error(`Unexpected SQL: ${sql}`);
        }

        assert.match(sql, /product_id IN \(\?1, \?2\)/);
        assert.match(sql, /status = 'published'/);

        const ids = new Set(bindings);

        const result = rows
          .filter((row) =>
            ids.has(row.product_id) &&
            row.status === "published"
          )
          .sort((a, b) =>
            String(a.product_id).localeCompare(String(b.product_id)) ||
            a.sort_order - b.sort_order ||
            String(a.created_at).localeCompare(String(b.created_at))
          );

        return { results: result };
      }
    };
  }

  return {
    prepare,
    calls
  };
}

const rows = [
  {
    id: "pm-a1",
    product_id: "prod-a",
    media_type: "image",
    role: "primary",
    storage_key: "product-media/prod-a/a1.webp",
    content_type: "image/webp",
    file_size: 1000,
    width: 1200,
    height: 900,
    duration_seconds: null,
    poster_storage_key: null,
    alt_text: "A primary",
    title: "A primary",
    sort_order: 0,
    status: "published",
    created_at: "2026-09-27T10:00:00.000Z",
    updated_at: "2026-09-27T10:00:00.000Z"
  },
  {
    id: "pm-a2",
    product_id: "prod-a",
    media_type: "image",
    role: "application",
    storage_key: "product-media/prod-a/a2.webp",
    content_type: "image/webp",
    file_size: 1100,
    width: 1200,
    height: 900,
    duration_seconds: null,
    poster_storage_key: null,
    alt_text: "A application",
    title: "A application",
    sort_order: 2,
    status: "published",
    created_at: "2026-09-27T10:02:00.000Z",
    updated_at: "2026-09-27T10:02:00.000Z"
  },
  {
    id: "pm-a-draft",
    product_id: "prod-a",
    media_type: "video",
    role: "application",
    storage_key: "product-media/prod-a/draft.mp4",
    content_type: "video/mp4",
    file_size: 2000,
    width: 1280,
    height: 720,
    duration_seconds: 30,
    poster_storage_key: null,
    alt_text: "Draft",
    title: "Draft",
    sort_order: 1,
    status: "draft",
    created_at: "2026-09-27T10:01:00.000Z",
    updated_at: "2026-09-27T10:01:00.000Z"
  },
  {
    id: "pm-b1",
    product_id: "prod-b",
    media_type: "video",
    role: "application",
    storage_key: "product-media/prod-b/b1.mp4",
    content_type: "video/mp4",
    file_size: 3000,
    width: 1280,
    height: 720,
    duration_seconds: 45,
    poster_storage_key: null,
    alt_text: "B application",
    title: "B application",
    sort_order: 1,
    status: "published",
    created_at: "2026-09-27T10:03:00.000Z",
    updated_at: "2026-09-27T10:03:00.000Z"
  }
];

test("batch media groups published media by product with one query", async () => {
  const db = makeDb(rows);

  const result = await listProductMediaByProductIds(
    db,
    ["prod-a", "prod-b", "prod-a"]
  );

  assert.equal(db.calls.length, 1);

  assert.deepEqual(
    db.calls[0].bindings,
    ["prod-a", "prod-b"]
  );

  assert.ok(result instanceof Map);

  assert.equal(result.size, 2);

  assert.deepEqual(
    result.get("prod-a").map((item) => item.id),
    ["pm-a1", "pm-a2"]
  );

  assert.deepEqual(
    result.get("prod-b").map((item) => item.id),
    ["pm-b1"]
  );

  assert.equal(
    result.get("prod-a").some((item) => item.status === "draft"),
    false
  );
});

test("batch media returns empty map without database query for empty input", async () => {
  const db = makeDb(rows);

  const result = await listProductMediaByProductIds(db, []);

  assert.ok(result instanceof Map);
  assert.equal(result.size, 0);
  assert.equal(db.calls.length, 0);
});

test("batch media normalizes duplicate and empty product ids", async () => {
  const db = makeDb(rows);

  const result = await listProductMediaByProductIds(
    db,
    ["", null, "prod-a", "prod-a", "  ", "prod-b"]
  );

  assert.equal(db.calls.length, 1);
  assert.deepEqual(
    db.calls[0].bindings,
    ["prod-a", "prod-b"]
  );

  assert.equal(result.size, 2);
});