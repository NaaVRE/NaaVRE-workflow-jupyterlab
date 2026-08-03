export interface IGeoFeature {
  geometry: {
    type: string;
    coordinates: unknown;
  };
  properties?: Record<string, unknown>;
}

export interface IBBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function toFeatures(json: unknown): IGeoFeature[] {
  if (!json || typeof json !== 'object') {
    return [];
  }
  const obj = json as Record<string, unknown>;
  switch (obj.type) {
    case 'FeatureCollection':
      return Array.isArray(obj.features)
        ? (obj.features as IGeoFeature[]).filter(f => f && f.geometry)
        : [];
    case 'Feature':
      return (obj as unknown as IGeoFeature).geometry
        ? [obj as unknown as IGeoFeature]
        : [];
    default:
      return obj.coordinates
        ? [{ geometry: obj as IGeoFeature['geometry'] }]
        : [];
  }
}

export function eachPosition(
  coords: unknown,
  fn: (lng: number, lat: number) => void
): void {
  if (!Array.isArray(coords)) {
    return;
  }
  if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
    fn(coords[0], coords[1]);
    return;
  }
  for (const c of coords) {
    eachPosition(c, fn);
  }
}

export function isLonLatBounds(b: IBBox): boolean {
  return b.minX >= -180 && b.maxX <= 180 && b.minY >= -90 && b.maxY <= 90;
}

export function boundsOf(features: IGeoFeature[]): IBBox | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const f of features) {
    eachPosition(f.geometry?.coordinates, (lng, lat) => {
      if (lng < minX) {
        minX = lng;
      }
      if (lng > maxX) {
        maxX = lng;
      }
      if (lat < minY) {
        minY = lat;
      }
      if (lat > maxY) {
        maxY = lat;
      }
    });
  }
  if (!Number.isFinite(minX)) {
    return null;
  }
  return { minX, minY, maxX, maxY };
}
