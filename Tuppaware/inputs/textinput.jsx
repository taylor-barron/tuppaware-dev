"use client";

import { useEffect, useState } from "react";
import { replaceDefaults } from "../utils/replacedefaults";
import FlexBox from "../containers/flexbox";
import Icon from "../text/icon";

export default function TextInput({
  value,
  defaultValue = "",
  onChange,
  placeholder = "",
  inputClassName = "",
  writeable = true,

  useLeftIcon = true,
  leftIconClassName = "fa fa-search",
  defaultLeftIconClassName = "fa fa-search",
  leftIconStyle = {},
  defaultLeftIconStyle = { position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#888" },

  useRightIcon = true,
  rightIconClassName = "fa fa-times",
  defaultRightIconClassName = "fa fa-times",
  rightIconStyle = {},
  defaultRightIconStyle = { position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#888" },

  inputStyle = {},
  defaultInputStyle = { paddingLeft: "2.25rem", fontSize: "1rem", border: "1px solid #ccc", borderRadius: "4px", outline: "none", width: "100%", boxSizing: "border-box", color: "#000" },

  containerStyle = {},
  defaultContainerStyle = { width: "100%", position: "relative" },

  ...props
}) {
  const leftIconStyleObject = replaceDefaults(defaultLeftIconStyle, leftIconStyle);
  const rightIconStyleObject = replaceDefaults(defaultRightIconStyle, rightIconStyle);
  const inputStyleObject = replaceDefaults(defaultInputStyle, inputStyle);
  const containerStyleObject = replaceDefaults(defaultContainerStyle, containerStyle);

  const resolvedLeftIconClassName = leftIconClassName === "" ? defaultLeftIconClassName : leftIconClassName;
  const resolvedRightIconClassName = rightIconClassName === "" ? defaultRightIconClassName : rightIconClassName;

  const resolvedInputStyle = { ...inputStyleObject };
  if (!useLeftIcon) delete resolvedInputStyle.paddingLeft;
  if (useRightIcon) resolvedInputStyle.paddingRight = "2.25rem";

  const [internalValue, setInternalValue] = useState(value ?? defaultValue ?? "");

  useEffect(() => {
    if (value !== undefined) setInternalValue(value ?? "");
  }, [value]);

  const handleChange = (e) => {
    setInternalValue(e.target.value);
    onChange?.(e);
  };

  const clearValue = () => {
    setInternalValue("");
    onChange?.({ target: { value: "" } });
  };

  // TODO: docs

  return (
    <FlexBox direction="row" vertical="baseline" horizontal="left" style={containerStyleObject}>
      {useLeftIcon ? (
        <Icon
          className={resolvedLeftIconClassName}
          style={leftIconStyleObject}
        />
      ) : null}

      <input
        disabled={!writeable}
        type="text"
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={inputClassName}
        style={resolvedInputStyle}
        {...props}
      />

      {useRightIcon ? (
        <Icon
          className={resolvedRightIconClassName}
          style={rightIconStyleObject}
          onClick={clearValue}
          role="button"
          aria-label="Clear input"
        />
      ) : null}
    </FlexBox>
  );
}