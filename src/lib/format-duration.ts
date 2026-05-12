/** Formats seconds as `MM:SS`, or `—` when invalid or non-positive. */
export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "—";
  const secs = Math.floor(totalSeconds % 60);
  const mins = Math.floor(totalSeconds / 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/** Human-friendly length, e.g. `3 mins 23 secs`, or `—` when missing/invalid. */
export function formatDurationSpoken(
  totalSeconds: number | undefined | null,
): string {
  if (
    totalSeconds == null ||
    !Number.isFinite(totalSeconds) ||
    totalSeconds <= 0
  ) {
    return "—";
  }
  const total = Math.floor(totalSeconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  if (mins === 0) {
    return secs === 1 ? "1 sec" : `${secs} secs`;
  }
  if (secs === 0) {
    return mins === 1 ? "1 min" : `${mins} mins`;
  }
  const mPart = mins === 1 ? "1 min" : `${mins} mins`;
  const sPart = secs === 1 ? "1 sec" : `${secs} secs`;
  return `${mPart} ${sPart}`;
}
