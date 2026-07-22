import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  console.log(`[SCRAPING ROUTE NO EXIST] | IP: ${ip}`);

  return new NextResponse(null, { status: 204 });
}
