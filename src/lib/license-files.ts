import { mkdir, readFile, writeFile, unlink, readdir } from "fs/promises";
import path from "path";
import { getDataDir } from "@/lib/data-store";

const MAX_PDF_BYTES = 15 * 1024 * 1024;

export type FileMeta = {
  fileName: string;
  uploadedAt: string;
};

function getUploadsDir() {
  return path.join(getDataDir(), "uploads");
}

export function sanitizeLicenseId(licenseId: string) {
  if (!/^[a-zA-Z0-9_-]+$/.test(licenseId)) {
    return null;
  }
  return licenseId;
}

function pdfPath(licenseId: string) {
  return path.join(getUploadsDir(), `${licenseId}.pdf`);
}

function metaPath(licenseId: string) {
  return path.join(getUploadsDir(), `${licenseId}.meta.json`);
}

export async function ensureUploadsDir() {
  await mkdir(getUploadsDir(), { recursive: true });
}

export async function listFileManifest(): Promise<Record<string, string>> {
  await ensureUploadsDir();
  const entries = await readdir(getUploadsDir());
  const manifest: Record<string, string> = {};

  for (const entry of entries) {
    if (!entry.endsWith(".meta.json")) {
      continue;
    }

    const licenseId = entry.replace(/\.meta\.json$/, "");
    try {
      const raw = await readFile(metaPath(licenseId), "utf8");
      const meta = JSON.parse(raw) as FileMeta;
      if (meta.fileName) {
        manifest[licenseId] = meta.fileName;
      }
    } catch {
      // Skip corrupt metadata.
    }
  }

  return manifest;
}

export async function getFileMeta(licenseId: string): Promise<FileMeta | null> {
  try {
    const raw = await readFile(metaPath(licenseId), "utf8");
    return JSON.parse(raw) as FileMeta;
  } catch {
    return null;
  }
}

export async function readPdf(licenseId: string): Promise<Buffer | null> {
  try {
    return await readFile(pdfPath(licenseId));
  } catch {
    return null;
  }
}

export async function savePdf(
  licenseId: string,
  fileName: string,
  bytes: Buffer,
): Promise<FileMeta> {
  if (bytes.length === 0) {
    throw new Error("Empty file.");
  }
  if (bytes.length > MAX_PDF_BYTES) {
    throw new Error("PDF must be 15 MB or smaller.");
  }
  if (!fileName.toLowerCase().endsWith(".pdf")) {
    throw new Error("Only PDF files are allowed.");
  }
  // Basic PDF magic-number check
  if (bytes.subarray(0, 4).toString("utf8") !== "%PDF") {
    throw new Error("File does not look like a PDF.");
  }

  await ensureUploadsDir();
  const meta: FileMeta = {
    fileName: path.basename(fileName),
    uploadedAt: new Date().toISOString(),
  };
  await writeFile(pdfPath(licenseId), bytes);
  await writeFile(metaPath(licenseId), JSON.stringify(meta, null, 2), "utf8");
  return meta;
}

export async function deletePdf(licenseId: string) {
  await Promise.allSettled([
    unlink(pdfPath(licenseId)),
    unlink(metaPath(licenseId)),
  ]);
}

export { MAX_PDF_BYTES };
