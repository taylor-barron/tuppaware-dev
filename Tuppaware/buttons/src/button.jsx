import { replaceDefaults } from "../../utils/src/replacedefaults";
import { EMPTY_STYLE, EMPTY_CLASS_NAME, NOOP } from "../../utils/src/globaldefaults";
import { DEFAULT_BUTTON_STYLE, DEFAULT_LEADING_ICON_STYLE, DEFAULT_TRAILING_ICON_STYLE } from "../utils/button-defaults";
import Icon from "../../text/icon";

export default function Button({
  onClick = NOOP,
  className = EMPTY_CLASS_NAME,
  style = EMPTY_STYLE,
  
  leadingIconClassName = EMPTY_CLASS_NAME,
  leadingIconStyle = EMPTY_STYLE,
  trailingIconClassName = EMPTY_CLASS_NAME,
  trailingIconStyle = EMPTY_STYLE,

  children,

}) {
  const buttonStyleObject = replaceDefaults(DEFAULT_BUTTON_STYLE, style);
  const leadingIconStyleObject = replaceDefaults(DEFAULT_LEADING_ICON_STYLE, leadingIconStyle);
  const trailingIconStyleObject = replaceDefaults(DEFAULT_TRAILING_ICON_STYLE, trailingIconStyle);

  return (
    <button className={className} style={buttonStyleObject} onClick={onClick}>
      {leadingIconClassName !== EMPTY_CLASS_NAME && <Icon className={leadingIconClassName} style={leadingIconStyleObject} />}
      {children}
      {trailingIconClassName !== EMPTY_CLASS_NAME && <Icon className={trailingIconClassName} style={trailingIconStyleObject} />}
    </button>
  );
}