import { NextRequest, NextResponse } from "next/server";
import { validateBackendToken } from "@/lib/validate-token";
import { isValidReferer } from "@/lib/allowed-referers";
import { fetchWithTimeout } from "@/lib/fetch-timeout";
import { FIELD_MAP } from "@/lib/token";

const ENC_DEC_API = "https://enc-dec.app/api";

const VIDFAST_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
  Referer: "https://vidfast.vc/",
  "X-Requested-With": "XMLHttpRequest",
};

async function fetchVidfastStreams(
  tmdbId: string,
  imdbId: string | null,
  mediaType: string,
  season: string | null,
  episode: string | null,
): Promise<{ links: any[]; subtitles: any[] }> {
  const id = imdbId || tmdbId;

  const page =
    mediaType === "movie"
      ? `https://vidfast.vc/movie/${id}`
      : `https://vidfast.vc/tv/${id}/${season}/${episode}/`;

  // Fetch page
  const html = await fetchWithTimeout(page, {}, 15000).then((r) => r.text());

  const match = html.match(/\\"en\\":\\"(.*?)\\"/);

  if (!match) {
    throw new Error("Unable to extract encrypted text");
  }

  const text = match[1];

  // Encrypt
  const enc = await fetchWithTimeout(
    `${ENC_DEC_API}/enc-vidfast?text=${encodeURIComponent(text)}`,
    {},
    10000,
  ).then((r) => r.json());

  if (enc.status !== 200) {
    throw new Error(enc.error || "enc-vidfast failed");
  }

  const { servers, stream, token } = enc.result;

  const headers = {
    ...VIDFAST_HEADERS,
    "X-CSRF-Token": token,
  };

  // Get server list
  const encryptedServers = await fetchWithTimeout(
    servers,
    {
      method: "POST",
      headers,
    },
    15000,
  ).then((r) => r.text());

  const decServers = await fetchWithTimeout(
    `${ENC_DEC_API}/dec-vidfast`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: encryptedServers,
      }),
    },
    10000,
  ).then((r) => r.json());

  if (decServers.status !== 200) {
    throw new Error(decServers.error || "dec-vidfast failed");
  }

  const serversList = decServers.result;
  const allServers = [
    "Beta",
    "Bravo",
    "vFast",
    "vEdge",
    "Cobra",
    "Charlie",
    "Max",
  ];
  // Only use Bravo
  const server = serversList.find((s: any) => s.name === allServers[1]);

  if (!server) {
    throw new Error("Bravo server not found");
  }

  // Get Bravo stream
  const encryptedStream = await fetchWithTimeout(
    `${stream}/${server.data}`,
    {
      method: "POST",
      headers,
    },
    15000,
  ).then((r) => r.text());

  const decStream = await fetchWithTimeout(
    `${ENC_DEC_API}/dec-vidfast`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: encryptedStream,
      }),
    },
    10000,
  ).then((r) => r.json());

  if (decStream.status !== 200) {
    throw new Error(decStream.error || "dec-vidfast failed");
  }

  const result = decStream.result;

  const links: any[] = [];
  const subtitles: any[] = [];

  // Only return HLS
  if (typeof result.url === "string" && result.url.includes(".m3u8")) {
    links.push({
      type: "hls",
      link: result.url,
      resolution: 0,
    });
  }

  for (const s of result.tracks ?? []) {
    subtitles.push({
      id: s.id,
      display: s.label ?? s.language,
      file: s.file ?? s.url,
    });
  }

  return { links, subtitles };
}
export async function GET(req: NextRequest) {
  try {
    const tmdbId = req.nextUrl.searchParams.get(FIELD_MAP.id);
    const mediaType = req.nextUrl.searchParams.get("b");
    const season = req.nextUrl.searchParams.get(FIELD_MAP.season);
    const episode = req.nextUrl.searchParams.get(FIELD_MAP.episode);
    const title = req.nextUrl.searchParams.get(FIELD_MAP.title);
    const year = req.nextUrl.searchParams.get(FIELD_MAP.year);
    const imdbId = req.nextUrl.searchParams.get("imdb");
    const ts = Number(req.nextUrl.searchParams.get(FIELD_MAP.ts));
    const token = req.nextUrl.searchParams.get(FIELD_MAP.token)!;
    const f_token = req.nextUrl.searchParams.get(FIELD_MAP.fToken)!;

    if (!tmdbId || !mediaType || !title || !year || !ts || !token)
      return NextResponse.json(
        { success: false, error: "need token" },
        { status: 404 },
      );

    if (Date.now() - ts > 8000)
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 403 },
      );

    if (!validateBackendToken(tmdbId, f_token, ts, token))
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 403 },
      );

    if (!isValidReferer(req.headers.get("referer") || ""))
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );

    const { links, subtitles } = await fetchVidfastStreams(
      tmdbId,
      imdbId,
      mediaType,
      season,
      episode,
    );
    if (!links.length)
      return NextResponse.json(
        { success: false, error: "No streams found" },
        { status: 404 },
      );

    return NextResponse.json({ success: true, links, subtitles });
  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
