"use client";

import Flexbox from "../containers/flexbox";
import Icon from "../text/icon";
import { replaceDefaults } from "../utils/replacedefaults";

export default function Modal({
  isOpen = false,
  onClose = () => { isOpen = false; },

  headerText = "",
  useCloseIcon = true,
  closeIconClass = "fa fa-times",
  headerContainerStyle = {},
  defaultHeaderContainerStyle = {
    minWidth: "100%",
    alignItems: "baseline",
  },
  headerStyle = {},
  defaultHeaderStyle = { fontFamily: "system-ui"},
  iconStyle = {},
  defaultIconStyle = { cursor: "pointer" },

  modalClassName = "",
  modalStyle = {},
  defaultModalStyle = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 1000,
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "1rem 1rem",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
    maxWidth: "90vw",
    maxHeight: "90vh",
    overflow: "auto",
    border: "1px solid #ccc",
  },

  children,

}) {
  const headerContainerStyleObject = replaceDefaults(headerContainerStyle, defaultHeaderContainerStyle);
  const headerStyleObject = replaceDefaults(headerStyle, defaultHeaderStyle);
  const iconStyleObject = replaceDefaults(iconStyle, defaultIconStyle);

  const modalStyleObject = replaceDefaults(modalStyle, defaultModalStyle);

  if (!isOpen) return null;

  return (
    <Flexbox direction="column" className={modalClassName} style={modalStyleObject}>
      <Flexbox direction="row" horizontal="space-between" style={headerContainerStyleObject}>
        <Flexbox style={headerStyleObject}>{headerText}</Flexbox>

        {useCloseIcon ? <Icon className={closeIconClass} onClick={onClose} style={iconStyleObject} /> : null}
      </Flexbox>

      {children}
    </Flexbox>
  );
}