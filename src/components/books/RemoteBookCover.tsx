import type { ImgHTMLAttributes } from "react";

/**
 * Book covers load from many third-party hosts. Listing every host in
 * `images.remotePatterns` is impractical, so we keep a plain `<img>` here.
 */
export function RemoteBookCover(props: ImgHTMLAttributes<HTMLImageElement>) {
  const { alt = "", ...rest } = props;
  // eslint-disable-next-line @next/next/no-img-element -- see module comment
  return <img alt={alt} {...rest} />;
}
