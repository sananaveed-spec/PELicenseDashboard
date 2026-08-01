import { parseLicenseDate } from "./renewal-status";

export function formatLicenseDate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

export function toDateInputValue(dateString: string): string {
  const date = parseLicenseDate(dateString);
  if (!date) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromDateInputValue(isoValue: string): string {
  if (!isoValue.trim()) {
    return "";
  }

  const date = parseLicenseDate(isoValue);
  if (!date) {
    return "";
  }

  return formatLicenseDate(date);
}
