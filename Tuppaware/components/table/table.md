TODO: throw errors for invalid states

/-----------------------------------------------
/
/  PROPS
/
/-----------------------------------------------

writeable: Determines whether any actions can be taken on the table.
mobileBreakPoint = The point in px where the table will switch between desktop and mobile styling.

columns: Expects the columns data structure.
setColumns: Passed method that executes at top level to update columns on changes.

rowData: Expects the rows data structure.
setRows: Passed method that executes at top level to update rows on changes.

onColumnsChange: Resets several parent level data structures, primarily after column resize.
onColumnSort: Method applied when columns are sorted to update columns and rows using setRows and setColumns.
onRowClick: Method that is called when a row is clicked and the click is not to the action column.

useActionsColumn: Boolean that determines whether action column is used.
actionColWidth: In px the starting width of the action column.
actionColumn: Expects action column data structure.
useActionButton: Boolean sets whether action button will be used if actions column is enabled. Both useAcitonButton and useDropdownButton cannot be true at the same time.
actionButtonData: Expects action button data structure if useActionButton is true.
useDropdownButton: Boolean sets whether dropdown button will be used if actions column is enabled. Both useAcitonButton and useDropdownButton cannot be true at the same time.
dropdownButtonData: Expects dropdown button data structure if useActionButton is true.

tableClassName: Classes applied to top level of table.
tableStyle: Styles applied to top level of table.

tableHeadClassName: Classes applied to table head.
tableHeadStyle: Styles applied to table head.

headerClassName: Classes applied to column headers.
headerStyle: Styles applied to column headers.

textClassName: Classes applied to text in table cells.
textStyle: Styles applied to text in table cells.

tableHeadCellClassName: Classes applied to table heads.
tableHeadCellStyle: Styles applied to table heads.

columnSelectIconClass: Favicon icon class used in mobile table that when clicked allows users to switch displayed columns.
columnAddIconClass: Favicon icon class used to allow users to add another column in mobile table.
addColumnIconStyle: Styles applied to icon that allows users to add a column to mobile table.
addColumnIconContainerStyle: Style container for icon that allows users to add a column to mobile table.
maxMobileColumns: Integer that sets the maximum allowable columns to display at once for a mobile table.

rowOrderKey: Sets the key that is used to order columns.
minColWidth: Minimum width in px that a column can be resized to.
cascadeResize: Boolean value that sets whether resizing columns can take space from columns that are not to the immediate right or left of the resizing column. True allows cascading resize.

showSelected: Boolean that sets whether when a row is clicked it will be highlighted for the user.
oddRowStyle: Styles applied to odd rows only.
evenRowStyle: Styles applied to even rows only.
selectedRowStyle: Styles applied to selected rows only.

sortDescendingIcon: Favicon icon class displayed when column is sorted by descending.
sortAscendingIcon: Favicon icon class displayed when column is sorted by ascending.
unsortedIcon: Favicon icon class displayed when column is unsorted.

/-----------------------------------------------
/
/  DATA STRUCTURES
/
/-----------------------------------------------

/-----------------
/  COLUMNS:
/-----------------

This array is used to populate the columns, control the width of columns from the top level if desired, and to give a value to be used as a key for rows to populate their value for the column. 

Invalid States: The mapto values must be unique per column and must not equal the value for the Action Column mapto which is "actionColumn" by default.

Example Columns:
  const [columns, setColumns] = useState([
    { name: "Name", mapto: "name", length: 150 },
    { name: "Age", mapto: "age" },
    { name: "Location", mapto: "location" },
    { name: "Email", mapto: "email" },
  ]);

Required Fields:
  name: used for title of column headers
  mapto: key used to map row data to column data. each row with cell data for this column should have a key matching this value where the row value will be displayed in the cell

Optional Fields:
  length: length of column in px. This key will be set automatically if not specified prior to being rendered. All set values will be respected.


/-----------------
/ ROWS:
/-----------------

This array is used to populate the rows and dictate which row is selected.

Example Rows:
  const [rows, setRows] = useState([
    { data: { name: "John Doe", age: 30, location: "New York", email: "john@example.com" }, selected: false, originalOrder: 0, order: 0 },
    { data: { name: "Jane Smith", age: 25, location: "Los Angeles", email: "jane@example.com" }, selected: false },
    { data: { name: "Sam Johnson", age: 35, location: "Chicago", email: "sam@example.com" }, selected: false },
    { data: { name: "Emily Davis", age: 28, location: "Houston", email: "emily@example.com" }, selected: false },
    { data: { name: "Michael Brown", age: 32, location: "Phoenix", email: "michael@example.com" }, selected: false },
  ]);

Required Fields:
  data: Must contain object of keys that match the mapto values of the columns that they correspond to with values that will display in the cell of the corresponding column.

Optional Fields:
  selected: boolean that corresponds to whether column is selected. Selected columns can be highlighted in the UI.
  order (this key can be changed by setting orderKey value): Sets the order that the rows appear from top to bottom starting from 0.
  originalOrder: Used to set default ordering of rows when there is no sorting starting from 0.

/-----------------
/ ACTION COLUMN:
/-----------------

When the action column is in use this object sets the string that will be used as the column title and controls the width of the column. This can be controlled at the top level. Different data structures will control the functionality of the buttons used in the row.

Example Action Column:
  const [actionColumn, setActionColumn] = useState({ name: "Actions", length: 175 });

Required Fields:
  name: Value used for column header.

Optional Fields:
  length: Used to set width in px of the action column.

/-----------------
/ DROPDOWN BUTTON DATA:
/-----------------

When using an action button and when dropdown button type is used this data structure determines functionality and display of the buttons on each row. All passed functions will be applied to the row where the button or dropdown item is clicked.

Example Dropdown Button Data:
  dropdownButtonData={{
    text: 'Dropdown Button',

    outerContainerStyle: {},
    outerContainerClassName: "",

    buttonContainerStyle: {},
    buttonContainerClassName: "",

    onButtonClick: (rowData, rowIndex) => {
      alert(`Dropdown Button clicked for row ${rowIndex + 1}: ${JSON.stringify(rowData)}`);
    },
    buttonClassName: "",
    buttonStyle: {},
    leadingIconClassName: "fa fa-bars",
    leadingIconStyle: { marginRight: "0.5rem" },
    trailingIconClassName: "",
    trailingIconStyle: {},

    dropdownSelectContainerStyle: {},
    dropdownSelectContainerClassName: "",
    dropdownIconStyle: {},
    defaultDropdownIconStyle: { margin: "0.25rem 0.5rem", fontSize: "1rem" },

    dropdownContainerStyle: {},
    dropdownContainerClassName: "",
    dropdownIconStyle: {},

    dropdownContainerStyle: {},
    dropdownContainerClassName: "",

    showDropdown: false,
    bottomRowsToShowUpwardsDropdown: 2,
    dropdownItems: [
      { title: "Option 1", action: (rowData, rowIndex) => alert(`Option 1 clicked for row ${rowIndex + 1}: ${JSON.stringify(rowData)}`) },
      { title: "Option 2", action: (rowData, rowIndex) => alert(`Option 2 clicked for row ${rowIndex + 1}: ${JSON.stringify(rowData)}`) },
      { title: "Option 3", action: (rowData, rowIndex) => alert(`Option 3 clicked for row ${rowIndex + 1}: ${JSON.stringify(rowData)}`) },
    ],
    actionElementStyle: {},
    actionElementClassName: "",
    urlElementStyle: {},
    urlElementClassName: "",
  }}

Props:
  Props are identical to props used for <a>dropdown button</a> but contained within one dropdownButtonData object.

/-----------------
/ ACTION BUTTON DATA:
/-----------------

When using an action button and when action button type is used this data structure determines functionality and display of the buttons on each row. The onClick function will be applied to the row where the button is clicked.

Example Action Button Data:
  actionButtonData={{
    text: "Review",
    leadingIconClassName: "fa fa-eye",
    trailingIconClassName: "fa fa-arrow-right",
    leadingIconStyle: { marginRight: "0.5rem" },
    trailingIconStyle: { marginLeft: "0.5rem" },
    style: { backgroundColor: "#4CAF50", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "4px", cursor: "pointer" },
    onClick: (rowData, rowIndex) => {
      alert(`Action for row ${rowIndex + 1}: ${JSON.stringify(rowData)}`);
    }
  }}

Props:
  Props are identical to props used for <a>action button</a> but contained in actionButtonData object.