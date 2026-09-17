"use client";

import Button from "../../buttons/button";
import DropdownButton from "../../buttons/dropdownbutton";
import { renderCellValue } from "./table-service";

export default function TableDesktop({
  tableClassName,
  tableStyleObject,
  tableHeadClassName,
  tableHeadStyleObject,
  columns,
  tableHeadCellClassName,
  useActionsColumn,
  actionColumn,
  rows,
  selectedRowIndex,
  showSelected,
  defaultSelectedRowStyle,
  selectedRowStyle,
  defaultEvenRowStyle,
  evenRowStyle,
  defaultOddRowStyle,
  oddRowStyle,
  handleRowClick,
  getBodyCellStyle,
  getActionCellStyle,
  useDropdownButton,
  dropdownButtonData,
  useActionButton,
  actionButtonData,
  headerRefs,
  totalColumns,
  getHeaderStyle,
  startResize,
  
}) {
  return (
    <table
      className={tableClassName}
      style={tableStyleObject}
    >
    </table>
  );
}