export function isFiniteCoordinate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function isLatitude(value: unknown): value is number {
  return isFiniteCoordinate(value) && value >= -90 && value <= 90;
}

export function isLongitude(value: unknown): value is number {
  return isFiniteCoordinate(value) && value >= -180 && value <= 180;
}
