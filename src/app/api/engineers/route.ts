import { NextResponse } from "next/server";
import { readEngineers, writeEngineers } from "@/lib/data-store";

export const runtime = "nodejs";

export async function GET() {
  try {
    const engineers = await readEngineers();
    return NextResponse.json({ engineers });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load engineers.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { engineers?: string[] };
    if (!Array.isArray(body.engineers)) {
      return NextResponse.json(
        { error: "Expected { engineers: string[] }." },
        { status: 400 },
      );
    }

    await writeEngineers(body.engineers);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save engineers.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
