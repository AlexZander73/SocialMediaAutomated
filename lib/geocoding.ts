import { Coordinates, ResolvedLocation } from "@/lib/types";

const reverseGeocodeCache = new Map<string, ResolvedLocation>();

function cacheKey({ latitude, longitude }: Coordinates): string {
  return `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
}

export async function reverseGeocodeCoordinates(coords: Coordinates): Promise<ResolvedLocation> {
  const key = cacheKey(coords);
  const cached = reverseGeocodeCache.get(key);
  if (cached) {
    return cached;
  }

  const endpoint = new URL("https://nominatim.openstreetmap.org/reverse");
  endpoint.searchParams.set("format", "jsonv2");
  endpoint.searchParams.set("lat", String(coords.latitude));
  endpoint.searchParams.set("lon", String(coords.longitude));
  endpoint.searchParams.set("zoom", "13");
  endpoint.searchParams.set("addressdetails", "1");

  const response = await fetch(endpoint.toString(), {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Reverse geocoding failed (${response.status})`);
  }

  const payload = (await response.json()) as {
    display_name?: string;
    address?: {
      city?: string;
      town?: string;
      village?: string;
      state?: string;
      region?: string;
      country?: string;
    };
  };

  const resolved: ResolvedLocation = {
    latitude: coords.latitude,
    longitude: coords.longitude,
    displayName: payload.display_name,
    city: payload.address?.city || payload.address?.town || payload.address?.village,
    region: payload.address?.state || payload.address?.region,
    country: payload.address?.country,
    source: "geocoded"
  };

  reverseGeocodeCache.set(key, resolved);
  return resolved;
}

export function coordinatesOnlyLocation(coords: Coordinates): ResolvedLocation {
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    source: "coordinates"
  };
}
