export default function FlexBox({
  children,
  className = "",
  style = {},
  vertical = "center",
  horizontal = "center",
  direction = "row",
  ...props
}) {
  const horizontalValue =
    horizontal === "left" ? "flex-start" :
    horizontal === "right" ? "flex-end" :
    "center";

  const verticalValue =
    vertical === "top" ? "flex-start" :
    vertical === "bottom" ? "flex-end" :
    vertical === "center" ? "center" :
    "baseline";

  const normalizedDirection =
    direction === "row" ||
    direction === "row-reverse" ||
    direction === "column" ||
    direction === "column-reverse"
      ? direction
      : "row";

  const isRow = normalizedDirection === "row" || normalizedDirection === "row-reverse";

  const justifyContent = isRow ? horizontalValue : verticalValue;
  const alignItems = isRow ? verticalValue : horizontalValue;

  const baseStyles = {
    display: "flex",
    flexDirection: normalizedDirection,
    justifyContent,
    alignItems,
  };

  return (
    <div className={className} style={{ ...baseStyles, ...style }} {...props}>
      {children}
    </div>
  );
}