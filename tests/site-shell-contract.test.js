import test from "node:test";
import assert from "node:assert/strict";
import { storeSiteShell } from "../src/site/store-site-shell.js";
import { productsSiteResponse } from "../src/site/products-live-response.js";

test("Store home exposes the independent commerce structure", () => {
  const html = storeSiteShell("/", "en");

  for (const label of [
    "AGRO-ZIA STORE",
    "AGRICULTURAL MARKETPLACE",
    "Products",
    "Suppliers",
    "Request a Quote",
    "Orders",
    "My Account",
    "Cart"
  ]) {
    assert.match(
      html,
      new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    );
  }

  assert.match(html, /class="hero"/);
  assert.match(html, /class="store-header"/);
  assert.match(html, /class="hero-actions"/);

  assert.doesNotMatch(html, /Agricultural Solutions Beyond Borders/);
  assert.doesNotMatch(html, />About</);
  assert.doesNotMatch(html, />Knowledge</);
});

test("Store shell supports the planned primary routes", () => {
  for (const path of [
    "/products",
    "/suppliers",
    "/rfq",
    "/cart",
    "/checkout",
    "/orders",
    "/account",
    "/about",
    "/contact",
    "/knowledge"
  ]) {
    const html = storeSiteShell(path, "en");

    assert.match(html, /<title>/);
    assert.match(html, /class="store-header"/);
    assert.match(html, /<footer/);
  }
});

test("Products route is wired to the live Store Product API", async () => {
  const response = productsSiteResponse("/products", "en");
  assert.equal(response.status, 200);

  const html = await response.text();

  assert.match(html, /data-live-products/);
  assert.match(html, /const endpoint='\/api\/products\?limit='\+limit/);
  assert.match(html, /Source: Store Product API/);
  assert.match(html, /No sample catalog data is presented as live inventory/);
});

test("Product detail route is wired to a published product slug", async () => {
  const response = productsSiteResponse("/products/example-product", "en");
  assert.equal(response.status, 200);

  const html = await response.text();

  assert.match(html, /data-live-product/);
  assert.match(html, /\/api\/products\//);
  assert.match(html, /Product not found/);
});