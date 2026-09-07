import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { initialEngineers } from "@/lib/engineers";
import { initialLicenses, type PeLicense } from "@/lib/licenses";

export function getDataDir() {
  return process.env.DATA_DIR?.trim() || path.join(process.cwd(), "data");
}

export async function ensureDataDir() {
  await mkdir(getDataDir(), { recursive: true });
}

function licensesPath() {
  return path.join(getDataDir(), "licenses.json");
}

function engineersPath() {
  return path.join(getDataDir(), "engineers.json");
}

function normalizeLicense(raw: Partial<PeLicense> & { id: string }): PeLicense {
  return {
    id: raw.id,
    engineerName: raw.engineerName ?? "",
    state: raw.state ?? "",
    stateFullName: raw.stateFullName ?? "",
    licenseType: raw.licenseType ?? "",
    licenseNumber: raw.licenseNumber ?? "",
    issueDate: raw.issueDate ?? "",
    expiryDate: raw.expiryDate ?? "",
    issuingAuthority: raw.issuingAuthority ?? "",
    address: raw.address ?? "",
    associatedBusinessName: raw.associatedBusinessName ?? "",
    verifyOnlineUrl: raw.verifyOnlineUrl ?? "",
    fileName: raw.fileName ?? null,
  };
}

export async function readLicenses(): Promise<PeLicense[]> {
  await ensureDataDir();
  try {
    const raw = await readFile(licensesPath(), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      throw new Error("Invalid licenses.json");
    }
    return parsed
      .filter(
        (item): item is Partial<PeLicense> & { id: string } =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as { id?: unknown }).id === "string",
      )
      .map(normalizeLicense);
  } catch {
    const seeded = initialLicenses.map((license) => normalizeLicense(license));
    await writeLicenses(seeded);
    return seeded;
  }
}

export async function writeLicenses(licenses: PeLicense[]) {
  await ensureDataDir();
  const normalized = licenses.map(normalizeLicense);
  await writeFile(
    licensesPath(),
    JSON.stringify(normalized, null, 2),
    "utf8",
  );
}

export async function readEngineers(): Promise<string[]> {
  await ensureDataDir();
  try {
    const raw = await readFile(engineersPath(), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      throw new Error("Invalid engineers.json");
    }
    return parsed
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .map((name) => name.trim());
  } catch {
    const seeded = [...initialEngineers];
    await writeEngineers(seeded);
    return seeded;
  }
}

export async function writeEngineers(engineers: string[]) {
  await ensureDataDir();
  const unique = [...new Set(engineers.map((name) => name.trim()).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b),
  );
  await writeFile(engineersPath(), JSON.stringify(unique, null, 2), "utf8");
}
