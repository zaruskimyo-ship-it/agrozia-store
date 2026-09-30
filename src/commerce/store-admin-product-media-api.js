import { requireAdmin } from "../auth/admin-repository.js";
import { createAdminProductMedia } from "./store-admin-product-media-repository.js";
import { deleteProductMedia } from "./product-media-repository.js";
import { getProductById } from "./store-admin-product-repository.js";
import {
  listAdminProductMedia,
  validateMediaMetadata,
  validateMediaUpload
} from "./store-admin-product-media-repository.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8"
    }
  });
}

function route(pathname) {
  const match = pathname.match(
    /^\/api\/store-admin\/products\/([^/]+)\/media$/
  );

  if (!match) return null;

  let productId;

  try {
    productId = decodeURIComponent(match[1]);
  } catch {
    return null;
  }

  if (!productId.trim()) return null;

  return {
    productId
  };
}

function isMutationRole(role) {
  return role === "admin" || role === "manager";
}

function repositoryError(error) {
  const message = error instanceof Error
    ? error.message
    : "store_admin_product_media_error";

  const known = new Set([
    "invalid_product_id",
    "invalid_media_file",
    "invalid_media_file_size",
    "unsupported_media_type",
    "image_file_too_large",
    "video_file_too_large",
    "invalid_media_role",
    "invalid_media_status",
    "invalid_media_sort_order"
  ]);

  if (known.has(message)) {
    return json({
      ok: false,
      error: message
    }, 400);
  }

  return json({
    ok: false,
    error: "store_admin_product_media_unavailable"
  }, 503);
}

async function readMultipart(request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("multipart/form-data")) {
    return null;
  }

  try {
    return await request.formData();
  } catch {
    return null;
  }
}

export async function handleStoreAdminProductMedia(
  request,
  env,
  pathname
) {
  if (!pathname.startsWith("/api/store-admin/products/")) {
    return null;
  }

  const match = route(pathname);

  if (!match) {
    return null;
  }

  const auth = await requireAdmin(
    env.STORE_DB,
    request,
    ["admin", "manager", "operator"]
  );

  if (!auth.ok) {
    return json({
      ok: false,
      error: auth.status === 403
        ? "forbidden"
        : "unauthorized"
    }, auth.status);
  }
  const product = await getProductById(
    env.STORE_DB,
    match.productId
  );

  if (!product) {
    return json({
      ok: false,
      error: "product_not_found"
    }, 404);
  }

  try {
    if (request.method === "GET") {
      const media = await listAdminProductMedia(
        env.STORE_DB,
        match.productId
      );

      return json({
        ok: true,
        media: media.map((item) => ({
          id: item.id,
          media_type: item.media_type,
          role: item.role,
          content_type: item.content_type,
          file_size: item.file_size,
          width: item.width,
          height: item.height,
          duration_seconds: item.duration_seconds,
          alt_text: item.alt_text,
          title: item.title,
          sort_order: item.sort_order,
          status: item.status
        }))
      });
    }

    if (request.method === "POST") {
      if (!isMutationRole(auth.admin.role)) {
        return json({
          ok: false,
          error: "forbidden"
        }, 403);
      }

      if (product.status === "archived") {
        return json({
          ok: false,
          error: "product_archived"
        }, 409);
      }

      const form = await readMultipart(request);

      if (!form) {
        return json({
          ok: false,
          error: "invalid_multipart"
        }, 400);
      }

      const file = form.get("file");

      if (!file || typeof file.arrayBuffer !== "function") {
        return json({
          ok: false,
          error: "invalid_media_file"
        }, 400);
      }

      let upload;

      try {
        upload = validateMediaUpload(file);
      } catch (error) {
        return repositoryError(error);
      }

      const metadata = validateMediaMetadata({
        role: form.get("role") || "gallery",
        status: form.get("status") || "draft",
        sort_order: form.get("sort_order") || 0,
        alt_text: form.get("alt_text"),
        title: form.get("title")
      });

      if (!env.STORE_ATTACHMENTS || typeof env.STORE_ATTACHMENTS.put !== "function") {
        return json({
          ok: false,
          error: "store_attachments_unavailable"
        }, 503);
      }

      const mediaId = crypto.randomUUID();

      const extensionMap = new Map([
        ["image/jpeg", "jpg"],
        ["image/png", "png"],
        ["image/webp", "webp"],
        ["image/gif", "gif"],
        ["image/avif", "avif"],
        ["video/mp4", "mp4"],
        ["video/webm", "webm"]
      ]);

      const extension = extensionMap.get(upload.contentType);

      if (!extension) {
        return json({
          ok: false,
          error: "unsupported_media_type"
        }, 400);
      }

      const storageKey =
        `product-media/${match.productId}/${mediaId}.${extension}`;

      const body = await file.arrayBuffer();

      try {
        await env.STORE_ATTACHMENTS.put(storageKey, body, {
          httpMetadata: {
            contentType: upload.contentType
          }
        });
      } catch {
        return json({
          ok: false,
          error: "media_storage_unavailable"
        }, 503);
      }

      let media;

      try {
        media = await createAdminProductMedia(
          env.STORE_DB,
          {
            id: mediaId,
            product_id: match.productId,
            media_type: upload.mediaType,
            role: metadata.role,
            storage_key: storageKey,
            content_type: upload.contentType,
            file_size: upload.size,
            alt_text: metadata.alt_text,
            title: metadata.title,
            sort_order: metadata.sort_order,
            status: metadata.status
          }
        );
      } catch {
        try {
          if (typeof env.STORE_ATTACHMENTS.delete === "function") {
            await env.STORE_ATTACHMENTS.delete(storageKey);
          }
        } catch {
          return json({
            ok: false,
            error: "media_metadata_failed_cleanup_failed"
          }, 503);
        }

        return json({
          ok: false,
          error: "media_metadata_unavailable"
        }, 503);
      }

      if (!media) {
        try {
          if (typeof env.STORE_ATTACHMENTS.delete === "function") {
            await env.STORE_ATTACHMENTS.delete(storageKey);
          }
        } catch {
          return json({
            ok: false,
            error: "media_metadata_failed_cleanup_failed"
          }, 503);
        }

        return json({
          ok: false,
          error: "media_metadata_unavailable"
        }, 503);
      }

      return json({
        ok: true,
        media: {
          id: media.id,
          media_type: media.media_type,
          role: media.role,
          content_type: media.content_type,
          file_size: media.file_size,
          width: media.width,
          height: media.height,
          duration_seconds: media.duration_seconds,
          alt_text: media.alt_text,
          title: media.title,
          sort_order: media.sort_order,
          status: media.status
        }
      }, 201);
    }

    return json({
      ok: false,
      error: "method_not_allowed"
    }, 405);

  } catch (error) {
    return repositoryError(error);
  }
}