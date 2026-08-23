import { replaceDefaults } from "../../Tuppaware/utils/replacedefaults";
import Icon from "../text/icon";

export default function Button({
  children,
  onClick,
  className = "",
  style = {},
  defaultStyle = { padding: "0.5rem 1rem", fontSize: "1rem", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer", backgroundColor: "#f0f0f0", color: "#000" },

  leadingIconClassName = "",
  leadingIconStyle = {},
  defaultLeadingIconStyle = { marginRight: "0.5rem" },
  trailingIconClassName = "",
  trailingIconStyle = {},
  defaultTrailingIconStyle = { marginLeft: "0.5rem" },
}) {
  const usedStyle = replaceDefaults(defaultStyle, style);
  const usedLeadingIconStyle = replaceDefaults(defaultLeadingIconStyle, leadingIconStyle);
  const usedTrailingIconStyle = replaceDefaults(defaultTrailingIconStyle, trailingIconStyle);

  return (
    <button className={className} style={usedStyle} onClick={onClick}>
      {leadingIconClassName && <Icon className={leadingIconClassName} style={usedLeadingIconStyle} />}
      {children}
      {trailingIconClassName && <Icon className={trailingIconClassName} style={usedTrailingIconStyle} />}
    </button>
  );
}