import { replaceDefaults } from "../utils/replacedefaults";

export default function Header({
  children,
  size = 1,
  className = "",
  style = {},
  defaultStyles = { fontSize: "2.25rem", fontFamily: "system-ui", lineHeight: "2.5rem", fontWeight: 500 },
  ...props
}) {
  const parsed = Number.parseInt(String(size), 10);
  const level = Number.isNaN(parsed) ? 1 : Math.min(6, Math.max(1, parsed));
  const Tag = `h${level}`;

  const usedStyle = replaceDefaults(defaultStyles, style);

  return (
    <Tag className={className} style={usedStyle} {...props}>
      {children}
    </Tag>
  );
}