"use client";

import { useState } from "react";
import { replaceDefaults } from "../../utils/src/replacedefaults";
import Flexbox from "../../containers/flexbox";

export default function VerticalList({
  listItems = [],
  onSelection = (item) => item,
  listStyle = {},
  defaultListStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    fontFamily: "system-ui",
    cursor: "pointer"
  },
  itemStyle = {},
  defaultItemStyle = {
    padding: "0.5rem 0.75rem",
    borderRadius: "4px",
  },
  hoverItemStyle = {},
  defaultHoverItemStyle = {
    backgroundColor: "#d9edf7",
  }

}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const combinedListStyle = replaceDefaults(defaultListStyle, listStyle);
  const combinedItemStyle = replaceDefaults(defaultItemStyle, itemStyle);
  const combinedHoverStyle = replaceDefaults(defaultHoverItemStyle, hoverItemStyle);

  return (
    <Flexbox style={combinedListStyle}>
      {listItems.map((item, index) => {
        const isHovered = hoveredIndex === index;

        const restingStyle = item.backgroundColor
          ? { ...combinedItemStyle, backgroundColor: item.backgroundColor }
          : combinedItemStyle;

        const finalStyle = isHovered
          ? {
              ...restingStyle,
              ...combinedHoverStyle,
              ...(item.hoverColor ? { backgroundColor: item.hoverColor } : {}),
            }
          : restingStyle;

        return (
          <div
            key={index}
            onClick={() => onSelection(item)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={finalStyle}
          >
            {item.name}
          </div>
        );
      })}
    </Flexbox>
  );
}