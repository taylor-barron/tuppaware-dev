TODO: throw errors for invalid states

/-----------------------------------------------
/
/  PROPS
/
/-----------------------------------------------

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

When using an action button and when dropdown button type is used this data structure determines functionality and display of the buttons on each row.

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

/-----------------
/ ACTION BUTTON DATA:
/-----------------

When using an action button and when action button type is used this data structure determines functionality and display of the buttons on each row.

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
