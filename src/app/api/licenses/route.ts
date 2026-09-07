import { NextResponse } from "next/server";
import { readLicenses, writeLicenses } from "@/lib/data-store";
import type { PeLicense } from "@/lib/licenses";
import { listFileManifest } from "@/lib/license-files";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [licenses, files] = await Promise.all([
      readLicenses(),
      listFileManifest(),
    ]);

    const withFiles = licenses.map((license) => ({
      ...license,
      fileName: files[license.id] ?? license.fileName ?? null,
    }));

    return NextResponse.json({ licenses: withFiles });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load licenses.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { licenses?: PeLicense[] };
    if (!Array.isArray(body.licenses)) {
      return NextResponse.json(
        { error: "Expected { licenses: PeLicense[] }." },
        { status: 400 },
      );
    }

    await writeLicenses(body.licenses);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save licenses.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
