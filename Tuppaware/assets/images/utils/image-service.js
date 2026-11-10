import { EMPTY_STRING } from "../../../utils/src/globaldefaults";

export function resolveSrc(src) {
  if (!src) return EMPTY_STRING;

  if (typeof src === "string") {
    return src.split("?")[0];
  }

  // object — could be StaticImageData, ESM module, or nested default
  if (typeof src === "object") {
    // next.js StaticImageData: { src: "/_next/...", width, height, ... }
    if (typeof src.src === "string") {
      return src.src.split("?")[0];
    }

    // ESM module default export: { default: "..." } or { default: { src: "..." } }
    if (src.default != null) {
      return resolveSrc(src.default);
    }
  }

  return EMPTY_STRING;
}