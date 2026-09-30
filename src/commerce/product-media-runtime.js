import { getPublishedProductMediaById } from "./product-media-repository.js";

function responseHeaders(media, object, extra = {}) {
  const headers = new Headers(extra);
  headers.set("content-type", media.content_type || object?.httpMetadata?.contentType || "application/octet-stream");
  if (media.file_size != null) headers.set("accept-ranges", "bytes");
  headers.set("cache-control", "public, max-age=86400, stale-while-revalidate=604800");
  return headers;
}

function parseRange(value, size) {
  if (!value || !Number.isFinite(size) || size < 0) return null;

  const match = /^bytes=(\d*)-(\d*)$/i.exec(value.trim());
  if (!match) return null;

  const startRaw = match[1];
  const endRaw = match[2];

  let start;
  let end;

  if (startRaw === "" && endRaw === "") return null;

  if (startRaw === "") {
    const suffixLength = Number(endRaw);
    if (!Number.isInteger(suffixLength) || suffixLength <= 0) return null;
    start = Math.max(0, size - suffixLength);
    end = size - 1;
  } else {
    start = Number(startRaw);
    if (!Number.isInteger(start) || start < 0 || start >= size) return null;

    end = endRaw === "" ? size - 1 : Number(endRaw);
    if (!Number.isInteger(end) || end < start) return null;
    end = Math.min(end, size - 1);
  }

  return { start, end, length: end - start + 1 };
}

export async function productMediaRuntime(request, env, pathname) {
  if (!pathname.startsWith("/media/")) return null;
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { allow: "GET, HEAD" }
    });
  }

  let mediaId;
  try {
    mediaId = decodeURIComponent(pathname.slice("/media/".length));
  } catch {
    return new Response("Not Found", { status: 404 });
  }

  if (!mediaId || mediaId.includes("/")) {
    return new Response("Not Found", { status: 404 });
  }

  const media = await getPublishedProductMediaById(env.STORE_DB, mediaId);
  if (!media) {
    return new Response("Not Found", { status: 404 });
  }

  if (!env.STORE_ATTACHMENTS) {
    return new Response("Media service unavailable", { status: 503 });
  }

  const object = await env.STORE_ATTACHMENTS.get(media.storage_key);
  if (!object) {
    return new Response("Not Found", { status: 404 });
  }

  const size = object.size ?? media.file_size ?? null;
  const range = size != null
    ? parseRange(request.headers.get("range"), size)
    : null;

  if (request.headers.has("range") && !range) {
    const headers = responseHeaders(media, object, {
      "content-range": `bytes */${size ?? "*"}`,
      "accept-ranges": "bytes"
    });
    return new Response(null, { status: 416, headers });
  }

  const headers = responseHeaders(media, object);

  if (object.httpEtag) {
    headers.set("etag", object.httpEtag);
  }

  if (size != null) headers.set("content-length", String(size));

  if (range) {
    const rangedObject = await env.STORE_ATTACHMENTS.get(media.storage_key, {
      range: {
        offset: range.start,
        length: range.length
      }
    });

    if (!rangedObject) {
      return new Response("Not Found", { status: 404 });
    }

    headers.set("content-range", `bytes ${range.start}-${range.end}/${size}`);
    headers.set("content-length", String(range.length));

    if (request.method === "HEAD") {
      return new Response(null, { status: 206, headers });
    }

    return new Response(rangedObject.body, { status: 206, headers });
  }

  if (request.method === "HEAD") {
    return new Response(null, { status: 200, headers });
  }

  return new Response(object.body, { status: 200, headers });
}