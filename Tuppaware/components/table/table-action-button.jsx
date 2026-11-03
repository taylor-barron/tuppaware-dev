"use client";

import Button from "../../buttons/button";
import DropdownButton from "../../buttons/dropdownbutton";

export default function TableActionButton({
  isVisible,
  columns,
  getActionCellStyle,
  useDropdownButton,
  dropdownButtonData,
  rowDropdownItems,
  useActionButton,
  actionButtonData,
  row,
  rowIndex,

}) {
  if (!isVisible) return null;

  return (
    <td style={getActionCellStyle(columns.length)}>
      {useDropdownButton ? (
        <DropdownButton
          outerContainerStyle={dropdownButtonData.outerContainerStyle}
          outerContainerClassName={dropdownButtonData.outerContainerClassName}
          buttonContainerStyle={dropdownButtonData.buttonContainerStyle}
          buttonContainerClassName={dropdownButtonData.buttonContainerClassName}
          onButtonClick={(event) => {
            event.stopPropagation();
            dropdownButtonData.onButtonClick?.(row, rowIndex);
          }}
          buttonClassName={dropdownButtonData.buttonClassName}
          buttonStyle={dropdownButtonData.buttonStyle}
          leadingIconClassName={dropdownButtonData.leadingIconClassName}
          leadingIconStyle={dropdownButtonData.leadingIconStyle}
          trailingIconClassName={dropdownButtonData.trailingIconClassName}
          trailingIconStyle={dropdownButtonData.trailingIconStyle}
          dropdownContainerStyle={dropdownButtonData.dropdownContainerStyle}
          dropdownContainerClassName={dropdownButtonData.dropdownContainerClassName}
          dropdownIconStyle={dropdownButtonData.dropdownIconStyle}
          showDropdown={dropdownButtonData.showDropdown}
          bottomRowsToShowUpwardsDropdown={dropdownButtonData.bottomRowsToShowUpwardsDropdown}
          dropdownItems={rowDropdownItems}
          actionElementStyle={dropdownButtonData.actionElementStyle}
          actionElementClassName={dropdownButtonData.actionElementClassName}
          urlElementStyle={dropdownButtonData.urlElementStyle}
          urlElementClassName={dropdownButtonData.urlElementClassName}
        >
          {dropdownButtonData.text}
        </DropdownButton>

      ) : useActionButton ? (
        <Button
          style={actionButtonData.style}
          className={actionButtonData.className}
          leadingIconClassName={actionButtonData.leadingIconClassName}
          leadingIconStyle={actionButtonData.leadingIconStyle}
          trailingIconClassName={actionButtonData.trailingIconClassName}
          trailingIconStyle={actionButtonData.trailingIconStyle}
          onClick={(event) => {
            event.stopPropagation();
            actionButtonData.onClick?.(row, rowIndex);
          }}
        >
          {actionButtonData.text}
        </Button>
        
      ) : null}
    </td>
  );
}