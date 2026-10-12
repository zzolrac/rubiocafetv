const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const muxApiBase = "https://api.mux.com/video/v1";

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getMuxAuthHeader() {
  const tokenId = Deno.env.get("MUX_TOKEN_ID");
  const tokenSecret = Deno.env.get("MUX_TOKEN_SECRET");

  if (!tokenId || !tokenSecret) {
    throw new Error("Mux credentials are not configured");
  }

  return `Basic ${btoa(`${tokenId}:${tokenSecret}`)}`;
}

async function muxRequest(path: string, init: RequestInit = {}) {
  const response = await fetch(`${muxApiBase}${path}`, {
    ...init,
    headers: {
      Authorization: getMuxAuthHeader(),
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    console.error("Mux API request failed", response.status, data);
    throw new Error("Mux request failed");
  }

  return data;
}

async function handleCreateUpload(req: Request, body: Record<string, unknown>) {
  const filename = typeof body.filename === "string" ? body.filename.trim() : "video";
  const contentType = typeof body.contentType === "string" ? body.contentType : "";
  const fileSize = typeof body.fileSize === "number" ? body.fileSize : 0;

  if (!contentType.startsWith("video/")) {
    return jsonResponse({ error: "Only video uploads are allowed" }, 400);
  }

  if (fileSize <= 0 || fileSize > 500 * 1024 * 1024) {
    return jsonResponse({ error: "Video size is invalid or exceeds the 500 MB limit" }, 400);
  }

  const origin = req.headers.get("origin") ?? "*";
  const data = await muxRequest("/uploads", {
    method: "POST",
    body: JSON.stringify({
      cors_origin: origin,
      new_asset_settings: {
        playback_policy: ["public"],
        passthrough: filename.slice(0, 255),
      },
    }),
  });

  return jsonResponse({
    uploadId: data.data?.id,
    uploadUrl: data.data?.url,
  });
}

async function handleDeleteAsset(body: Record<string, unknown>) {
  const assetId = typeof body.assetId === "string" ? body.assetId.trim() : "";

  if (!assetId || !/^[a-zA-Z0-9_-]+$/.test(assetId)) {
    return jsonResponse({ error: "Invalid asset" }, 400);
  }

  const response = await fetch(`${muxApiBase}/assets/${assetId}`, {
    method: "DELETE",
    headers: { Authorization: getMuxAuthHeader() },
  });

  // Mux returns 204 on success; 404 means it was already gone — both are fine.
  if (response.status === 204 || response.status === 404) {
    return jsonResponse({ deleted: true });
  }

  const data = await response.json().catch(() => null);
  console.error("Mux delete asset failed", response.status, data);
  return jsonResponse({ error: "Unable to delete Mux asset" }, 500);
}

async function handleCheckUpload(body: Record<string, unknown>) {  const uploadId = typeof body.uploadId === "string" ? body.uploadId.trim() : "";

  if (!uploadId || !/^[a-zA-Z0-9_-]+$/.test(uploadId)) {
    return jsonResponse({ error: "Invalid upload" }, 400);
  }

  const uploadData = await muxRequest(`/uploads/${uploadId}`);
  const upload = uploadData.data;

  if (upload?.status === "errored" || upload?.status === "cancelled") {
    return jsonResponse({ status: upload.status, error: "Mux could not process this video" }, 422);
  }

  if (upload?.status !== "asset_created" || !upload.asset_id) {
    return jsonResponse({ status: upload?.status ?? "waiting" });
  }

  const assetData = await muxRequest(`/assets/${upload.asset_id}`);
  const playbackId = assetData.data?.playback_ids?.find(
    (playback: { policy?: string; id?: string }) => playback.policy === "public",
  )?.id;

  if (!playbackId) {
    return jsonResponse({ status: "processing", assetId: upload.asset_id });
  }

  return jsonResponse({
    status: "ready",
    assetId: upload.asset_id,
    playbackId,
    playbackUrl: `https://stream.mux.com/${playbackId}.m3u8`,
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    const body = await req.json();
    if (body.action === "create-upload") {
      return await handleCreateUpload(req, body);
    }
    if (body.action === "check-upload") {
      return await handleCheckUpload(body);
    }
    if (body.action === "delete-asset") {
      return await handleDeleteAsset(body);
    }

    return jsonResponse({ error: "Invalid action" }, 400);
  } catch (error) {
    console.error("Mux function error", error);
    const message = error instanceof Error ? error.message : "";
    if (message.includes("Mux credentials are not configured")) {
      return jsonResponse({ error: "Mux credentials are not configured", code: "mux_not_configured" }, 500);
    }
    return jsonResponse({ error: "Unable to process Mux request" }, 500);
  }
});
