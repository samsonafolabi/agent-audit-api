import { NextRequest, NextResponse } from "next/server";

const VALID_API_KEY = process.env.API_KEY;

export function middleware(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey) {
    return NextResponse.json(
      { error: "API key required in X-API-Key header" },
      { status: 401 },
    );
  }

  if (apiKey !== VALID_API_KEY) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
