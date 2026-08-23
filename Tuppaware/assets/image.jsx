import { replaceDefaults } from "../utils/replacedefaults";

export default function Image({
  src,
  alt = "",
  className = "",
  style = {},
  defaultStyle = { width: "100%", height: "auto" },
  url = "https://www.espn.com",
  ...props
}) {
  const acceptableTypes = ["png", "jpg", "jpeg", "gif", "svg", "webp"];
  const cleanSrc = String(src).split("?")[0];
  const fileType = cleanSrc.split(".").pop().toLowerCase();
  if (!acceptableTypes.includes(fileType)) {
    console.warn(`Unsupported image type: ${fileType}`);
    return null;
  }

  const mergedStyle = replaceDefaults(defaultStyle, style);

  return (
    <>
      {url !== "" ? (
        <a href={url} target="_self">
          <img src={src} alt={alt} className={className} style={mergedStyle} {...props} />
        </a>
      ) : (
        <img src={src} alt={alt} className={className} style={mergedStyle} {...props} />
      )}
    </>
  );
}