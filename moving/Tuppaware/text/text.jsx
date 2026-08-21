import { replaceDefaults } from "../utils/replacedefaults";

export default function Text({
  children,
  type = "p",
  className = "",
  style = {},
  defaultStyles = { fontSize: "1.5rem", lineHeight: "2rem", fontWeight: 300 },
  ...props
}) {
  const acceptableTypes = ["p", "i", "b", "label", "strong", "em"];
  if (!acceptableTypes.includes(type)) {
    console.warn(`Invalid type "${type}" provided to Text component. Defaulting to "p".`);
    type = "p";
  }

  const Tag = `${type}`;
  const usedStyle = replaceDefaults(defaultStyles, style);

  return (
    <Tag className={className} style={usedStyle} {...props}>
      {children}
    </Tag>
  );
}