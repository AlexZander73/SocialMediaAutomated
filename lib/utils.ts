import { LocationFormat, Orientation, ResolvedLocation, SpellingStyle } from "@/lib/types";

export function getExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() ?? "" : "";
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[index]}`;
}

export function formatDuration(seconds?: number): string {
  if (!seconds || Number.isNaN(seconds)) {
    return "Unknown";
  }

  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function dedupe<T>(values: T[]): T[] {
  return [...new Set(values)];
}

export function inferOrientation(width?: number, height?: number): Orientation {
  if (!width || !height) {
    return "unknown";
  }
  if (width === height) {
    return "square";
  }
  return width > height ? "landscape" : "portrait";
}

export function isoToDisplayDate(iso?: string, spelling: SpellingStyle = "us"): string {
  if (!iso) {
    return "Unknown date";
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat(spelling === "uk" ? "en-GB" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
}

export function toTitleCase(value: string): string {
  return value
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function cleanText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function formatLocation(location: ResolvedLocation | undefined, mode: LocationFormat): string {
  if (!location || mode === "hidden") {
    return "";
  }

  if (mode === "coordinates") {
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  }

  if (mode === "city-region") {
    const cityRegion = [location.city, location.region].filter(Boolean).join(", ");
    return cityRegion || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  }

  return (
    location.displayName ||
    [location.city, location.region, location.country].filter(Boolean).join(", ") ||
    `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
  );
}

export function maybeEmoji(enabled: boolean, emoji: string): string {
  return enabled ? ` ${emoji}` : "";
}

export function slugFromText(text: string): string {
  return text
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase())
    .join("");
}

export function uniqueId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
