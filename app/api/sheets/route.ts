import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getScriptUrl() {
  return process.env.GOOGLE_SCRIPT_URL;
}

async function proxyToScript(request: NextRequest, method: string) {
  const scriptUrl = getScriptUrl();

  if (!scriptUrl) {
    return NextResponse.json(
      { error: "GOOGLE_SCRIPT_URL is not configured" },
      { status: 500 },
    );
  }

  const upstream = await fetch(`${scriptUrl}${request.nextUrl.search}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(method !== "GET" ? { "Content-Type": "application/json" } : {}),
      ...(request.headers.get("user-agent")
        ? { "User-Agent": request.headers.get("user-agent")! }
        : {}),
    },
    body: method === "GET" ? undefined : await request.text(),
    signal: AbortSignal.timeout(30_000),
  });

  const text = await upstream.text();
  const json = parseJson(text);

  if (!upstream.ok) {
    return NextResponse.json(
      {
        error: `Google Apps Script responded with ${upstream.status}`,
        detail: json,
      },
      { status: upstream.status },
    );
  }

  return NextResponse.json(json ?? { success: true });
}

export async function GET(request: NextRequest) {
  return proxyToScript(request, "GET");
}

export async function POST(request: NextRequest) {
  try {
    return await proxyToScript(request, "POST");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

function parseJson(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}