export type RenewalStatus = "Active" | "Expiring Soon" | "Expired" | "Unknown";

const EXPIRING_SOON_DAYS = 90;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function parseLicenseDate(dateString: string): Date | null {
  const trimmed = dateString.trim();
  if (!trimmed) {
    return null;
  }

  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const month = Number(slashMatch[1]) - 1;
    const day = Number(slashMatch[2]);
    const year = Number(slashMatch[3]);
    const date = new Date(year, month, day);

    if (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day
    ) {
      return date;
    }

    return null;
  }

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]) - 1;
    const day = Number(isoMatch[3]);
    const date = new Date(year, month, day);

    if (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day
    ) {
      return date;
    }

    return null;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : startOfDay(parsed);
}

export function getRenewalStatus(
  expiryDate: string,
  referenceDate: Date = new Date(),
): RenewalStatus {
  const expiry = parseLicenseDate(expiryDate);
  if (!expiry) {
    return "Unknown";
  }

  const today = startOfDay(referenceDate);
  const expiryDay = startOfDay(expiry);

  if (expiryDay < today) {
    return "Expired";
  }

  const expiringSoonLimit = new Date(today);
  expiringSoonLimit.setDate(expiringSoonLimit.getDate() + EXPIRING_SOON_DAYS);

  if (expiryDay <= expiringSoonLimit) {
    return "Expiring Soon";
  }

  return "Active";
}

export function getRenewalStatusClassName(status: RenewalStatus): string {
  switch (status) {
    case "Active":
      return "renewal-status renewal-status--active";
    case "Expiring Soon":
      return "renewal-status renewal-status--expiring-soon";
    case "Expired":
      return "renewal-status renewal-status--expired";
    default:
      return "renewal-status renewal-status--unknown";
  }
}
