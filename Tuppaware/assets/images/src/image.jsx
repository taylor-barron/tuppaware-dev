import { replaceDefaults } from "../../../utils/src/replacedefaults";
import { EMPTY_STYLE, EMPTY_CLASS_NAME, EMPTY_STRING } from "../../../utils/src/globaldefaults";
import { DEFAULT_IMAGE_STYLE } from "../utils/image-defaults";
import { resolveSrc } from "../utils/image-service";

export default function Image({
  src = EMPTY_STRING,
  alt = EMPTY_STRING,
  className = EMPTY_CLASS_NAME,
  style = EMPTY_STYLE,
  url = EMPTY_STRING,
  ...props
  
}) {
  const acceptableTypes = ["png", "jpg", "jpeg", "gif", "svg", "webp"];
  const cleanSrc = resolveSrc(src);
  const fileType = cleanSrc.split(".").pop().toLowerCase();
  
  if (!acceptableTypes.includes(fileType)) {
    console.warn(`Unsupported image type: ${fileType}`);
    return null;
  }

  const imageStyleObject = replaceDefaults(DEFAULT_IMAGE_STYLE, style);

  return (
    <>
      {url !== EMPTY_STRING ? (
        <a href={url} target="_self">
          <img src={cleanSrc} alt={alt} className={className} style={imageStyleObject} {...props} />
        </a>

      ) : (
        <img src={cleanSrc} alt={alt} className={className} style={imageStyleObject} {...props} />
      )}
    </>
  );
}