"use client";

import { replaceDefaults } from "../utils/replacedefaults";
import Flexbox from "../containers/flexbox";

export default function Overlay({
  isOpen = false,
  onClick = () => {},

  overlayStyle = {},
  defaultOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    cursor: "pointer"
  },

  children,

}) {
  const combinedOverlayStyle = replaceDefaults(defaultOverlayStyle, overlayStyle);

  if (!isOpen) return null;

  return (
    <Flexbox
      direction="column"
      style={combinedOverlayStyle}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClick(event);
      }}
    >
      {children}
    </Flexbox>
  );
}