import React from "react";
import { replaceDefaults } from "../utils/replacedefaults";
import Button from "./button";
import Flexbox from "../containers/flexbox";
import Icon from "../text/icon";

export default function DropdownButton({
  children,

  outerContainerStyle = {},
  defaultOuterContainerStyle = { display: "inline-flex", position: "relative" },
  outerContainerClassName = "",

  buttonContainerStyle = {},
  defaultButtonContainerStyle = {
    display: "inline-flex",
    position: "relative",
    cursor: "pointer",
    alignItems: "stretch",
    zIndex: 1,
  },
  buttonContainerClassName = "",

  onButtonClick,
  buttonClassName = "",
  buttonStyle = {},
  defaultButtonStyle = { padding: "0.5rem 1rem", fontSize: "1rem", border: "1px solid #ccc", borderRadius: "4px 0 0 4px", cursor: "pointer", backgroundColor: "#f0f0f0", color: "#000" },
  leadingIconClassName = "",
  leadingIconStyle = {},
  trailingIconClassName = "",
  trailingIconStyle = {},

  dropdownSelectContainerStyle = {},
  defaultDropdownSelectContainerStyle = {
    display: "flex",
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 0.5rem",
    border: "1px solid #ccc",
    borderLeft: "0",
    borderRadius: "0 4px 4px 0",
    background: "#f0f0f0",
    backgroundColor: "#f0f0f0",
    boxSizing: "border-box",
  },
  dropdownSelectContainerClassName = "",
  dropdownIconClosedClassName = "fa fa-caret-down",
  dropdownIconOpenClassName = "fa fa-caret-up",
  dropdownIconStyle = {},
  defaultDropdownIconStyle = { margin: 0, fontSize: "1rem", lineHeight: 1 },

  dropdownContainerStyle = {},
  defaultDropdownContainerStyle = {
    position: "absolute",
    left: 0,
    minWidth: "100%",
    zIndex: 1000,
    padding: "0.5rem 1rem",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: "#f0f0f0",
    color: "#000",
    zIndex: 1000,
  },
  dropdownContainerClassName = "",

  showDropdownOnTop = false,
  dropdownItems = [],
  actionElementStyle = {},
  defaultActionElementStyle = { padding: "0.25rem 0.5rem", cursor: "pointer", backgroundColor: "#f0f0f0" },
  actionElementClassName = "",
  urlElementStyle = {},
  defaultUrlElementStyle = { padding: "0.25rem 0.5rem", cursor: "pointer", textDecoration: "none", color: "inherit" },
  urlElementClassName = "",
}) {
  const usedOuterContainerStyle = replaceDefaults(defaultOuterContainerStyle, outerContainerStyle);
  const usedButtonStyle = replaceDefaults(defaultButtonStyle, buttonStyle);
  const usedButtonContainerStyle = replaceDefaults(defaultButtonContainerStyle, buttonContainerStyle);
  const usedDropdownSelectContainerStyle = replaceDefaults(defaultDropdownSelectContainerStyle, dropdownSelectContainerStyle);
  const usedDropdownIconStyle = replaceDefaults(defaultDropdownIconStyle, dropdownIconStyle);

  const positionedDropdownDefaults = {
    ...defaultDropdownContainerStyle,
    ...(showDropdownOnTop
      ? { bottom: "100%", marginBottom: "0.25rem" }
      : { top: "100%", marginTop: "0.25rem" }),
  };

  const usedDropdownContainerStyle = replaceDefaults(positionedDropdownDefaults, dropdownContainerStyle);
  const usedActionElementStyle = replaceDefaults(defaultActionElementStyle, actionElementStyle);
  const usedUrlElementStyle = replaceDefaults(defaultUrlElementStyle, urlElementStyle);

  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const handleMainButtonClick = (event) => {
    onButtonClick?.(event);
  };

  const handleToggleDropdownClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
  };

  return (
    <Flexbox className={outerContainerClassName} style={usedOuterContainerStyle} vertical="top" horizontal="left" direction="column">
      <Flexbox className={buttonContainerClassName} style={usedButtonContainerStyle} vertical="top" horizontal="left" direction="row">
        <Button
          className={buttonClassName}
          style={usedButtonStyle}
          onClick={handleMainButtonClick}
          leadingIconClassName={leadingIconClassName}
          leadingIconStyle={leadingIconStyle}
          trailingIconClassName={trailingIconClassName}
          trailingIconStyle={trailingIconStyle}
        >
          {children}
        </Button>

        <Flexbox
          className={dropdownSelectContainerClassName}
          style={usedDropdownSelectContainerStyle}
          vertical="top"
          horizontal="left"
          direction="column"
          onClick={handleToggleDropdownClick}
        >
          <Icon className={isDropdownOpen ? dropdownIconOpenClassName : dropdownIconClosedClassName} style={usedDropdownIconStyle} />
        </Flexbox>
      </Flexbox>

      {isDropdownOpen && (
        <Flexbox className={dropdownContainerClassName} style={usedDropdownContainerStyle} vertical="top" horizontal="left" direction="column">
          {dropdownItems.map((item, index) => (
            item.action ? (
              <Flexbox key={index} style={usedActionElementStyle} className={actionElementClassName} onClick={() => item.action && item.action()}>
                {item.title}
              </Flexbox>
            ) : (
              <a key={index} href={item.url ? item.url : "#"} style={usedUrlElementStyle} className={urlElementClassName}>
                {item.title}
              </a>
            )
          ))}
        </Flexbox>
      )}
    </Flexbox>
  );
}