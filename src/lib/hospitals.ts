import hubs from "@/data/chennai_trauma_hubs.json";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Hospital {
  id: string;
  name: string;
  zone: string;
  corridor: string;
  type: string;
  coordinates: Coordinates;
  emergency_gate: string;
  capabilities: string[];
  contact_dispatch: string;
}

export interface RankedHospital {
  hospital: Hospital;
  /** Straight-line distance in km, or null when the user's location is unknown. */
  distanceKm: number | null;
}

/** The supplied eight-record directory. Fields here are not independently verified. */
export const HOSPITALS: readonly Hospital[] = hubs;

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Straight-line (great-circle) distance in km. This is not driving distance. */
export function haversineKm(a: Coordinates, b: Coordinates): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** Returns the directory record for an ID, or undefined if the ID is not in the directory. */
export function getHospitalById(id: string): Hospital | undefined {
  return HOSPITALS.find((hospital) => hospital.id === id);
}

export function findHospitalsByCapability(capability: string): Hospital[] {
  return HOSPITALS.filter((hospital) => hospital.capabilities.includes(capability));
}

/**
 * Hospitals that list the capability. With a real origin they are sorted by
 * straight-line distance; without one they keep directory order and carry no
 * distance, so the UI never shows a made-up number.
 */
export function rankHospitals(capability: string, origin?: Coordinates): RankedHospital[] {
  const ranked = findHospitalsByCapability(capability).map((hospital) => ({
    hospital,
    distanceKm: origin ? haversineKm(origin, hospital.coordinates) : null,
  }));
  if (!origin) return ranked;
  return ranked.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
}

/** Google Maps directions link to the hospital's coordinates. */
export function directionsUrl(hospital: Hospital): string {
  const params = new URLSearchParams({
    api: "1",
    destination: `${hospital.coordinates.lat},${hospital.coordinates.lng}`,
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}