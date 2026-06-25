import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");
  const rawUrl = searchParams.get("url");

  if (!id && !rawUrl) {
    return NextResponse.json(
      { error: "Provide ?id=<embed_id> or ?url=<embed_url>" },
      { status: 400 },
    );
  }

  const embedUrl = rawUrl ?? `https://vidora.stream/embed/${id}`;

  let html: string;
  try {
    const res = await fetch(embedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        Referer: "https://vidora.stream/",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `HTTP ${res.status}` },
        { status: 502 },
      );
    }

    html = await res.text();
  } catch (err) {
    return NextResponse.json(
      { error: `Network error: ${(err as Error).message}` },
      { status: 502 },
    );
  }

  // Strategy 1: plain m3u8 in HTML
  const plainMatch = html.match(/https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/);
  if (plainMatch)
    return NextResponse.json({ m3u8: plainMatch[0], source: "plain" });

  // Strategy 2: unpack eval(p,a,c,k,e,d) then scan
  try {
    const unpacked = unpack(html);
    const m3u8Match = unpacked.match(/https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/);
    if (m3u8Match)
      return NextResponse.json({ m3u8: m3u8Match[0], source: "unpacked" });
  } catch {}

  // Strategy 3: sources:[{file:"..."}] pattern
  const sourcesMatch = html.match(
    /sources\s*:\s*\[\s*\{[^}]*file\s*:\s*["']([^"']+\.m3u8[^"']*)/,
  );
  if (sourcesMatch)
    return NextResponse.json({ m3u8: sourcesMatch[1], source: "sources_json" });

  return NextResponse.json({ error: "No m3u8 found." }, { status: 404 });
}

function unpack(html: string): string {
  const re =
    /eval\(function\(p,a,c,k,e,(?:r|d)\)\{.*?\}\('([\s\S]*?)',\s*(\d+)\s*,\s*\d+\s*,\s*'([\s\S]*?)'\.split\('([\s\S]*?)'\)/;
  const m = html.match(re);
  if (!m) throw new Error("No packed script found");

  let [, p, aStr, kStr, d] = m;
  const a = parseInt(aStr, 10);
  const k: string[] = kStr.split(d);

  let c = k.length;
  while (c--) {
    if (k[c]) p = p.replace(new RegExp(`\\b${toBase(c, a)}\\b`, "g"), k[c]);
  }
  return p;
}

function toBase(n: number, base: number): string {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  if (n < base) return chars[n];
  return toBase(Math.floor(n / base), base) + chars[n % base];
}
