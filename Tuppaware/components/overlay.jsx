"use client";

import { replaceDefaults } from "../utils/replacedefaults";
import Flexbox from "../containers/flexbox";

export default function Overlay({
  isOpen = false,

  overlayStyle = {},
  defaultOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center"
  },

  children,

}) {
  const combinedOverlayStyle = replaceDefaults(overlayStyle, defaultOverlayStyle);

  if (!isOpen) return null;

  return (
    <Flexbox direction="column" style={combinedOverlayStyle}>
      {children}
    </Flexbox>
  );
}