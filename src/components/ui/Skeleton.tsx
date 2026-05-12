import type { CSSProperties } from "react";

type SkeletonBlockProps = {
  height?: number;
  width?: string | number;
  className?: string;
  style?: CSSProperties;
};

export function SkeletonBlock({
  height = 140,
  width,
  className,
  style,
}: SkeletonBlockProps) {
  return (
    <div
      className={["skeletonPulse skeletonBlock", className].filter(Boolean).join(" ")}
      style={{ height, width, ...style }}
      aria-hidden
    />
  );
}
