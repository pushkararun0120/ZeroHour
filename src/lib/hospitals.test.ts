import { describe, expect, it } from "vitest";
import {
  HOSPITALS,
  directionsUrl,
  findHospitalsByCapability,
  getHospitalById,
  haversineKm,
  rankHospitals,
} from "./hospitals";

describe("hospital directory", () => {
  it("has the eight supplied records with unique IDs", () => {
    expect(HOSPITALS).toHaveLength(8);
    expect(new Set(HOSPITALS.map((h) => h.id)).size).toBe(8);
  });

  it("returns undefined for an ID that is not in the directory", () => {
    expect(getHospitalById("made-up-hospital")).toBeUndefined();
    expect(getHospitalById("kmc-kilpauk")?.name).toContain("Kilpauk");
  });
});

describe("capability matching", () => {
  it("finds the hospitals that list stroke thrombolysis", () => {
    const ids = findHospitalsByCapability("stroke_thrombolysis")
      .map((h) => h.id)
      .sort();
    expect(ids).toEqual(["apollo-greams", "gleneagles-perumbakkam", "kauvery-alwarpet"]);
  });

  it("finds only one hospital for electrical injury", () => {
    expect(findHospitalsByCapability("electrical_injury").map((h) => h.id)).toEqual([
      "kmc-kilpauk",
    ]);
  });

  it("returns nothing for an unknown capability", () => {
    expect(findHospitalsByCapability("teleportation")).toEqual([]);
  });
});

describe("haversineKm", () => {
  const rgggh = { lat: 13.0818, lng: 80.2772 };
  const kmc = { lat: 13.0784, lng: 80.2447 };

  it("is zero for the same point", () => {
    expect(haversineKm(rgggh, rgggh)).toBe(0);
  });

  it("is the same in both directions", () => {
    expect(haversineKm(rgggh, kmc)).toBeCloseTo(haversineKm(kmc, rgggh), 10);
  });

  it("gives a sensible straight-line distance between two nearby hospitals", () => {
    const km = haversineKm(rgggh, kmc);
    expect(km).toBeGreaterThan(3);
    expect(km).toBeLessThan(4);
  });
});

describe("rankHospitals", () => {
  it("sorts by straight-line distance when the origin is known", () => {
    const nearTambaram = { lat: 12.9249, lng: 80.1 };
    const ranked = rankHospitals("cath_lab", nearTambaram);
    expect(ranked[0].hospital.id).toBe("rela-chromepet");
    const distances = ranked.map((r) => r.distanceKm as number);
    expect(distances).toEqual([...distances].sort((a, b) => a - b));
  });

  it("gives no distance and keeps directory order without an origin", () => {
    const ranked = rankHospitals("cath_lab");
    expect(ranked.every((r) => r.distanceKm === null)).toBe(true);
    expect(ranked[0].hospital.id).toBe("rgggh-park-town");
  });
});

describe("directionsUrl", () => {
  it("builds a Google Maps directions link with the hospital coordinates", () => {
    const hospital = getHospitalById("rgggh-park-town");
    expect(hospital).toBeDefined();
    const url = new URL(directionsUrl(hospital!));
    expect(url.origin + url.pathname).toBe("https://www.google.com/maps/dir/");
    expect(url.searchParams.get("api")).toBe("1");
    expect(url.searchParams.get("destination")).toBe("13.0818,80.2772");
  });
});