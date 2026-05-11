export function SkeletonBlock({ height = 140 }: { height?: number }) {
  return (
    <div
      className="skeletonPulse skeletonBlock"
      style={{ height }}
      aria-hidden
    />
  );
}
