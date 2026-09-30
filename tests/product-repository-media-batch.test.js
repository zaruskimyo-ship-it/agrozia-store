import assert from "node:assert/strict";
import test from "node:test";

import { listPublicProducts } from "../src/commerce/product-repository.js";

function makeDb() {
  const calls = [];

  const products = [
    {
      id: "prod-a",
      slug: "product-a",
      name: "Product A",
      brand: null,
      category_id: null,
      status: "published",
      origin_country: null,
      moq: null,
      unit: null,
      availability_status: "in_stock",
      lead_time: null,
      price_visibility: "rfq",
      currency: "USD",
      price_min: null,
      price_max: null,
      supply_capacity: null,
      incoterms: null,
      short_description: "A",
      description: "Product A",
      specifications_json: "{}",
      packaging: null,
      application: "Agriculture",
      verification_level: null,
      verification_updated_at: null
    },
    {
      id: "prod-b",
      slug: "product-b",
      name: "Product B",
      brand: null,
      category_id: null,
      status: "published",
      origin_country: null,
      moq: null,
      unit: null,
      availability_status: "in_stock",
      lead_time: null,
      price_visibility: "rfq",
      currency: "USD",
      price_min: null,
      price_max: null,
      supply_capacity: null,
      incoterms: null,
      short_description: "B",
      description: "Product B",
      specifications_json: "{}",
      packaging: null,
      application: "Agriculture",
      verification_level: null,
      verification_updated_at: null
    }
  ];

  function prepare(sql) {
    let bindings = [];

    return {
      bind(...values) {
        bindings = values;
        return this;
      },

      async first() {
        calls.push({
          type: "first",
          sql,
          bindings: [...bindings]
        });

        if (sql.includes("COUNT(*) AS total")) {
          return { total: products.length };
        }

        throw new Error(`Unexpected first SQL: ${sql}`);
      },

      async all() {
        calls.push({
          type: "all",
          sql,
          bindings: [...bindings]
        });

        if (sql.includes("FROM commerce_products")) {
          return {
            results: products
          };
        }

        if (sql.includes("FROM commerce_product_media")) {
          assert.match(sql, /product_id IN \(\?1, \?2\)/);
          assert.match(sql, /status = 'published'/);

          return {
            results: [
              {
                id: "media-a",
                product_id: "prod-a",
                media_type: "image",
                role: "primary",
                storage_key: "product-media/a.webp",
                content_type: "image/webp",
                file_size: 1000,
                width: 1200,
                height: 900,
                duration_seconds: null,
                poster_storage_key: null,
                alt_text: "Product A",
                title: "Product A image",
                sort_order: 0,
                status: "published",
                created_at: "2026-09-27T10:00:00.000Z",
                updated_at: "2026-09-27T10:00:00.000Z"
              },
              {
                id: "media-b",
                product_id: "prod-b",
                media_type: "image",
                role: "primary",
                storage_key: "product-media/b.webp",
                content_type: "image/webp",
                file_size: 1000,
                width: 1200,
                height: 900,
                duration_seconds: null,
                poster_storage_key: null,
                alt_text: "Product B",
                title: "Product B image",
                sort_order: 0,
                status: "published",
                created_at: "2026-09-27T10:00:00.000Z",
                updated_at: "2026-09-27T10:00:00.000Z"
              }
            ]
          };
        }

        throw new Error(`Unexpected all SQL: ${sql}`);
      }
    };
  }

  return {
    prepare,
    calls
  };
}

test("listPublicProducts uses one batch media query for all products", async () => {
  const db = makeDb();

  const result = await listPublicProducts(db, {
    limit: 20,
    offset: 0
  });

  assert.equal(result.items.length, 2);

  assert.deepEqual(
    result.items.map((item) => item.id),
    ["prod-a", "prod-b"]
  );

  assert.deepEqual(
    result.items.map((item) => item.media.images[0].id),
    ["media-a", "media-b"]
  );

  const mediaQueries = db.calls.filter((call) =>
    call.sql.includes("FROM commerce_product_media")
  );

  assert.equal(mediaQueries.length, 1);

  assert.deepEqual(
    mediaQueries[0].bindings,
    ["prod-a", "prod-b"]
  );

  assert.equal(
    db.calls.some((call) =>
      call.sql.includes("WHERE product_id = ?1")
    ),
    false
  );
});