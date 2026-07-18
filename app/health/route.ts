export async function GET() {
  return Response.json({ status: "ok" }, { status: 404 });
}

export async function HEAD() {
  return new Response(null, { status: 404 });
}
