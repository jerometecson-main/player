import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("url");

  if (!target) {
    return new Response("Missing url", { status: 400 });
  }

  let decodedTarget: string;
  try {
    decodedTarget = decodeURIComponent(target);
  } catch {
    decodedTarget = target;
  }

  const headers: Record<string, string> = {
    Referer: "https://hls.shegu.net/",
    "User-Agent": request.headers.get("user-agent") ?? "Mozilla/5.0",
  };

  const range = request.headers.get("range");
  if (range) {
    headers.Range = range;
  }

  const res = await fetch(decodedTarget, {
    method: "GET",
    headers,
    redirect: "follow",
  });

  const contentType = res.headers.get("content-type") || "";

  // =========================================
  // PLAYLIST (.m3u8)
  // =========================================
  if (
    contentType.includes("mpegurl") ||
    contentType.includes("application/vnd.apple.mpegurl") ||
    decodedTarget.includes(".m3u8")
  ) {
    let text = await res.text();

    const origin = new URL(request.url).origin;
    const base = new URL(decodedTarget);

    text = text
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();

        if (!trimmed) return line;

        // Rewrite EXT-X-MAP
        if (trimmed.includes('URI="')) {
          return line.replace(/URI="([^"]+)"/g, (_, uri) => {
            const absolute = new URL(uri, base).toString();

            return `URI="${origin}/backend_/servers/atlas_v2/febbox_proxy?url=${encodeURIComponent(
              absolute,
            )}"`;
          });
        }

        // Leave playlist tags alone
        if (trimmed.startsWith("#")) {
          return line;
        }

        // Rewrite every URI (relative or absolute)
        const absolute = new URL(trimmed, base).toString();

        return `${origin}/backend_/servers/atlas_v2/febbox_proxy?url=${encodeURIComponent(
          absolute,
        )}`;
      })
      .join("\n");

    return new Response(text, {
      status: res.status,
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Expose-Headers": "*",
      },
    });
  }

  // =========================================
  // SEGMENTS (.m4s/.ts/.mp4)
  // =========================================
  const outHeaders = new Headers();

  const headersToCopy = [
    "content-type",
    "content-length",
    "accept-ranges",
    "content-range",
    "cache-control",
    "etag",
    "last-modified",
  ];

  for (const header of headersToCopy) {
    const value = res.headers.get(header);
    if (value) {
      outHeaders.set(header, value);
    }
  }

  outHeaders.set("Access-Control-Allow-Origin", "*");
  outHeaders.set("Access-Control-Expose-Headers", "*");

  return new Response(res.body, {
    status: res.status,
    headers: outHeaders,
  });
}
