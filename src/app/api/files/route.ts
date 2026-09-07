import { NextResponse } from "next/server";
import { listFileManifest } from "@/lib/license-files";

export const runtime = "nodejs";

export async function GET() {
  try {
    const files = await listFileManifest();
    return NextResponse.json({ files });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list files.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
