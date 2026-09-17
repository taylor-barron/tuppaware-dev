"use client";

import { useEffect, useState } from "react";
import { replaceDefaults } from "../../Tuppaware/utils/replacedefaults";
import useIsBelowBreakPoint from "../../Tuppaware/utils/watchmobilebreakpoint";
import Flexbox from "../../Tuppaware/containers/flexbox";
import Header from "../../Tuppaware/text/header";
import Icon from "../text/icon";
import TextInput from "../../Tuppaware/inputs/textinput";

export default function DualPickList({
  writeable = true,
  show: initialShow = false,
  mobileBreakPoint = 768, // px

  title = "Dual Pick List",
  titleStyle = {},
  defaultTitleStyle = { fontSize: "1.5rem", fontWeight: "bold" },

  leftHeader = "Available",
  rightHeader = "Selected",
  headerStyle = {},
  defaultHeaderStyle = { fontSize: "1.25rem", fontWeight: 250, lineHeight: "1.75rem" },

  selectStyle = {},
  defaultSelectStyle = { width: "100%", height: "100%", borderRadius: "0.25rem", border: "1px solid #ccc", padding: "0.5rem" },
  optionStyle = {},
  defaultOptionStyle = { fontSize: "1rem", padding: "0.5rem", cursor: "pointer" },
  boxStyle = {},
  defaultBoxStyle = { width: "45%", height: "250px", overflowY: "auto", borderRadius: "0.25rem" },
  defaultMobileBoxStyle = { width: "100%", height: "250px", overflowY: "auto", borderRadius: "0.25rem" },
  boxContainerStyle = {},
  defaultBoxContainerStyle = { width: "100%", marginTop: "0" },

  leftItems = [],
  rightItems = [],

  collapseIcon = "fa-minus",
  expandIcon = "fa-plus",
  headerIconStyle = {},
  defaultHeaderIconStyle = { fontSize: "1.5rem", marginLeft: "0.5rem", cursor: "pointer" },

  moveAllToRightIcon = "fa-angle-double-right",
  moveAllToBottomIcon = "fa-angle-double-down",
  moveSelectedToRightIcon = "fa-angle-right",
  moveSelectedToBottomIcon = "fa-angle-down",
  moveSelectedToLeftIcon = "fa-angle-left",
  moveSelectedToTopIcon = "fa-angle-up",
  moveAllToLeftIcon = "fa-angle-double-left",
  moveAllToTopIcon = "fa-angle-double-up",
  middleIconStyle = {},
  defaultMiddleIconStyle = { fontSize: "1.5rem", margin: "0.5rem", cursor: "pointer" },
  defaultMobileMiddleIconStyle = { fontSize: "1.5rem", marginLeft: "1rem", marginRight: "1rem", marginBottom: "1rem", cursor: "pointer" },

  outerContainerStyle = {},
  defaultOuterContainerStyle = { width: "100%", border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem", borderRadius: "0.5rem", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", backgroundColor: "#d8d8d8" },
  selectedRowBackgroundColor = "#e0e0e0",

  allowSearch = true,
  searchPlaceholder = "Search...",
  textInputClassName = "",
  textInputLeftClassName = "",
  textInputRightClassName = "",
  textInputUseLeftIcon = true,
  textInputUseRightIcon = true,
  textInputInputStyle = { paddingLeft: "2.25rem", fontSize: "1rem", border: "1px solid #ccc", borderRadius: "4px", outline: "none", width: "100%", boxSizing: "border-box", color: "#000" },
  textInputContainerStyle = { width: "100%", position: "relative", marginTop: "0.5rem" },
  textInputLeftIconStyle = {},
  textInputRightIconStyle = {},
  searchContainerStyle = {},
  defaultSearchContainerStyle = { width: "100%", marginTop: "0.5rem" },

  onChange = () => {},
}) {
  const isMobile = useIsBelowBreakPoint(mobileBreakPoint);
  const usedBoxStyle = isMobile ? { ...defaultMobileBoxStyle, ...boxStyle } : { ...defaultBoxStyle, ...boxStyle };
  const moveAllToSelectedIcon = isMobile ? moveAllToBottomIcon : moveAllToRightIcon;
  const moveSelectedToSelectedIcon = isMobile ? moveSelectedToBottomIcon : moveSelectedToRightIcon;
  const moveAllToUnselectedIcon = isMobile ? moveAllToTopIcon : moveAllToLeftIcon;
  const moveSelectedToUnselectedIcon = isMobile ? moveSelectedToTopIcon : moveSelectedToLeftIcon;
  const usedMiddleIconStyle = isMobile ? defaultMobileMiddleIconStyle : defaultMiddleIconStyle;

  const titleStyleObject = replaceDefaults(defaultTitleStyle, titleStyle);
  const headerStyleObject = replaceDefaults(defaultHeaderStyle, headerStyle);
  const selectStyleObject = replaceDefaults(defaultSelectStyle, selectStyle);
  const optionStyleObject = replaceDefaults(defaultOptionStyle, optionStyle);
  const outerContainerStyleObject = replaceDefaults(defaultOuterContainerStyle, outerContainerStyle);
  const boxStyleObject = usedBoxStyle;
  const boxContainerStyleObject = replaceDefaults(defaultBoxContainerStyle, boxContainerStyle);
  const headerIconStyleObject = replaceDefaults(defaultHeaderIconStyle, headerIconStyle);
  const middleIconStyleObject = replaceDefaults(usedMiddleIconStyle, middleIconStyle);
  const disabledMiddleIconStyleObject = writeable
    ? {}
    : {
        cursor: "not-allowed",
        opacity: 0.5,
      };
  const searchContainerStyleObject = replaceDefaults(defaultSearchContainerStyle, searchContainerStyle);

  const [show, setShow] = useState(initialShow);
  const [searchValue, setSearchValue] = useState("");

  const [leftState, setLeftState] = useState(leftItems);
  const [rightState, setRightState] = useState(rightItems);

  useEffect(() => setLeftState(leftItems), [leftItems]);
  useEffect(() => setRightState(rightItems), [rightItems]);

  const normalizedSearchValue = searchValue.trim().toLowerCase();

  const filteredLeftState = normalizedSearchValue
    ? leftState.filter((item) =>
        String(item.name).toLowerCase().includes(normalizedSearchValue)
      )
    : leftState;

  const filteredRightState = normalizedSearchValue
    ? rightState.filter((item) =>
        String(item.name).toLowerCase().includes(normalizedSearchValue)
      )
    : rightState;

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  const reorderItemsAlphabetically = (items) => {
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  };
  
  const leftSelectChange = (id) => {
    if (!writeable) return;

    setLeftState((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const moveSelectedToRight = () => {
    if (!writeable) return;

    const selectedItems = leftState.filter((item) => item.selected);
    const updatedLeftState = leftState.filter((item) => !item.selected);
    const updatedRightState = reorderItemsAlphabetically([...rightState, ...selectedItems.map(item => ({ ...item, selected: false }))]);

    setLeftState(updatedLeftState);
    setRightState(updatedRightState);
    onChange(updatedLeftState, updatedRightState);
  };

  const moveAllToRight = () => {
    if (!writeable) return;

    const updatedRightState = reorderItemsAlphabetically([...rightState, ...leftState.map(item => ({ ...item, selected: false }))]);
    setLeftState([]);
    setRightState(updatedRightState);
    onChange([], updatedRightState);
  };

  const moveSelectedToLeft = () => {
    if (!writeable) return;

    const selectedItems = rightState.filter((item) => item.selected);
    const updatedRightState = rightState.filter((item) => !item.selected);
    const updatedLeftState = reorderItemsAlphabetically([...leftState, ...selectedItems.map(item => ({ ...item, selected: false }))]);

    setRightState(updatedRightState);
    setLeftState(updatedLeftState);
    onChange(updatedLeftState, updatedRightState);
  };

  const moveAllToLeft = () => {
    if (!writeable) return;

    const updatedLeftState = reorderItemsAlphabetically([...leftState, ...rightState.map(item => ({ ...item, selected: false }))]);
    setRightState([]);
    setLeftState(updatedLeftState);
    onChange(updatedLeftState, []);
  };

  const rightSelectChange = (id) => {
    if (!writeable) return;

    setRightState((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const suppressNativeSelection = (e) => {
    e.preventDefault();
  };

  // TODO: document
  // TODO: leftItems and rightItems should be an array in the form of [{ id: 1, name: "Item 1", selected: false }, { id: 2, name: "Item 2", selected: true }, ...]

  return (
    <Flexbox direction="column" style={outerContainerStyleObject}>
      <Flexbox horizontal="left" vertical="center" style={{ width: "100%", justifyContent: "space-between", cursor: "pointer", alignItems: "baseline" }} onClick={() => setShow(!show)}>
        <Header size={2} style={titleStyleObject}>{title}</Header>
        <Icon className={`fa-regular ${show ? collapseIcon : expandIcon}`} style={headerIconStyleObject} />
      </Flexbox>

      {show && (
        <Flexbox direction="column" style={boxContainerStyleObject}>
          <Flexbox direction={isMobile ? "column" : "row"} horizontal="space-between" style={{ width: "100%", marginTop: "0.75rem", justifyContent: "space-between" }}>
            <Flexbox direction="column" style={boxStyleObject}>
              <Header size={3} style={headerStyleObject}>{leftHeader}</Header>
              <select multiple style={selectStyleObject} disabled={!writeable}>
                {filteredLeftState.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                    style={item.selected ? { backgroundColor: selectedRowBackgroundColor, ...optionStyleObject } : optionStyleObject}
                    onMouseDown={suppressNativeSelection}
                    onClick={() => leftSelectChange(item.id)}
                  >
                    {item.name}
                  </option>
                ))}
              </select>
            </Flexbox>

            <Flexbox direction={isMobile ? "row" : "column"} style={{ width: "10%", justifyContent: "center", marginTop: "2rem", alignItems: "center" }}>
              <Icon className={`fa-solid ${moveAllToSelectedIcon}`} style={{ ...middleIconStyleObject, ...disabledMiddleIconStyleObject }} onClick={moveAllToRight} />
              <Icon className={`fa-solid ${moveSelectedToSelectedIcon}`} style={{ ...middleIconStyleObject, ...disabledMiddleIconStyleObject }} onClick={moveSelectedToRight} />
              <Icon className={`fa-solid ${moveSelectedToUnselectedIcon}`} style={{ ...middleIconStyleObject, ...disabledMiddleIconStyleObject }} onClick={moveSelectedToLeft} />
              <Icon className={`fa-solid ${moveAllToUnselectedIcon}`} style={{ ...middleIconStyleObject, ...disabledMiddleIconStyleObject }} onClick={moveAllToLeft} />
            </Flexbox>

            <Flexbox direction="column" style={boxStyleObject}>
              <Header size={3} style={headerStyleObject}>{rightHeader}</Header>
              <select multiple style={selectStyleObject} disabled={!writeable}>
                {filteredRightState.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                    style={item.selected ? { backgroundColor: selectedRowBackgroundColor, ...optionStyleObject } : optionStyleObject}
                    onMouseDown={suppressNativeSelection}
                    onClick={() => rightSelectChange(item.id)}
                  >
                    {item.name}
                  </option>
                ))}
              </select>
            </Flexbox>
          </Flexbox>

          {allowSearch && (
            <Flexbox direction="column" style={searchContainerStyleObject}>
              <TextInput
                value={searchValue}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                inputClassName={textInputClassName}

                useLeftIcon={textInputUseLeftIcon}
                leftIconClassName={textInputLeftClassName}
                leftIconStyle={textInputLeftIconStyle}

                useRightIcon={textInputUseRightIcon}
                rightIconClassName={textInputRightClassName}
                rightIconStyle={textInputRightIconStyle}

                inputStyle={textInputInputStyle}
                containerStyle={textInputContainerStyle}
              />
            </Flexbox>
          )}
        </Flexbox>
      )}
    </Flexbox>
  );
}