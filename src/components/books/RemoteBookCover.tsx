import type { ImgHTMLAttributes } from "react";

export function RemoteBookCover(props: ImgHTMLAttributes<HTMLImageElement>) {
  const { alt = "", ...rest } = props;
  return <img alt={alt} {...rest} />;
}
