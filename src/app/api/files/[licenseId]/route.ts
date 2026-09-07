import { NextResponse } from "next/server";
import {
  deletePdf,
  getFileMeta,
  readPdf,
  sanitizeLicenseId,
  savePdf,
} from "@/lib/license-files";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ licenseId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { licenseId: rawId } = await context.params;
  const licenseId = sanitizeLicenseId(rawId);
  if (!licenseId) {
    return NextResponse.json({ error: "Invalid license id." }, { status: 400 });
  }

  const [meta, bytes] = await Promise.all([
    getFileMeta(licenseId),
    readPdf(licenseId),
  ]);

  if (!meta || !bytes) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${meta.fileName.replace(/"/g, "")}"`,
      "Content-Length": String(bytes.length),
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request, context: RouteContext) {
  const { licenseId: rawId } = await context.params;
  const licenseId = sanitizeLicenseId(rawId);
  if (!licenseId) {
    return NextResponse.json({ error: "Invalid license id." }, { status: 400 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file." }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const meta = await savePdf(licenseId, file.name || "license.pdf", bytes);
    return NextResponse.json({ fileName: meta.fileName });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { licenseId: rawId } = await context.params;
  const licenseId = sanitizeLicenseId(rawId);
  if (!licenseId) {
    return NextResponse.json({ error: "Invalid license id." }, { status: 400 });
  }

  await deletePdf(licenseId);
  return NextResponse.json({ ok: true });
}
