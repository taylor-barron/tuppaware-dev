"use client";

import { useState } from 'react';

import Button from '../../Tuppaware/buttons/button';
import DropdownButton from '../../Tuppaware/buttons/dropdownbutton';
import FlexBox from '../../Tuppaware/containers/flexbox';
import Header from '../../Tuppaware/text/header';
import Nav from '../../Tuppaware/components/nav';
import Table from '../../Tuppaware/components/table/table';
import Text from '../../Tuppaware/text/text';
import TextInput from '../../Tuppaware/inputs/textinput';
import TuppawareLogo from '../../public/tuppaware.png';

import DualPickList from '../../Tuppaware/components/dualpicklist';

export default function DevContainer() {
  const [columns, setColumns] = useState([
    { name: "Name", length: 150 },
    { name: "Age" },
    { name: "Location" },
  ]);

  const [actionColumn, setActionColumn] = useState({ name: "Actions", length: 175 });

  return (
    <>
      <Nav
        navItems={[
          { title: "Home", url: "/", icon: "fa fa-home" },
          { title: "About", url: "/about", icon: "fa fa-info-circle", subItems: [
            { title: "Team", url: "/about/team" },
            { title: "Company", url: "/about/company" },
          ]},
          { title: "Services", url: "/services", icon: "fa fa-cogs", subItems: [
            { title: "Consulting", url: "/services/consulting" },
            { title: "Development", url: "/services/development" },
            { title: "Design", url: "/services/design" },
          ]},
          { title: "Blog", url: "/blog", icon: "fa fa-blog" },
          { title: "Portfolio", url: "/portfolio", icon: "fa fa-briefcase" },
          { title: "Contact", url: "/contact", icon: "fa fa-envelope", subItems: [
            { title: "Email", url: "/contact/email" },
            { title: "Phone", url: "/contact/phone" },
          ]},
        ]}
        pinToTop={true}
        pinMarginTop="2rem"
        logo={TuppawareLogo}
        logoStyle={{ margin: "0 1rem 0 2rem"}}
        navItemsPinning="left"
      />

      <FlexBox className="h-screen" style={{ marginTop: "2rem" }} vertical="top" horizontal="center" direction="column">
        {/* need to do sorting */}
        {/* need to set up icons for sorting */}
        {/* need to test no button */}
        {/* need to test default mobile columns and selected mobile columns */}
        <Table
          tableStyle={{ margin: "5rem", width: "90%" }}
          columns={columns}
          actionColumn={actionColumn}
          onColumnsChange={({ columns: nextColumns, actionColumn: nextActionColumn }) => {
            setColumns(nextColumns);
            setActionColumn(nextActionColumn);
          }}

          // need to set an original position on initiation
          rowData={[
            { data: ["John Doe", 30, "New York"], selected: true },
            { data: ["Jane Smith", 25, "Los Angeles"], selected: false },
            { data: ["Sam Johnson", 35, "Chicago"], selected: false },
            { data: ["Emily Davis", 28, "Houston"], selected: false },
            { data: ["Michael Brown", 32, "Phoenix"], selected: false },
          ]}

          onRowClick={(rowData, rowIndex) => {
            alert(`Row ${rowIndex + 1} clicked: ${JSON.stringify(columns)} clicked: ${JSON.stringify(actionColumn)}`);
          }}

          useDropdownButton={true}
          actionFunction={(rowData, rowIndex) => {
            alert(`Action for row ${rowIndex + 1}: ${JSON.stringify(actionColumn)}`);
          }}
          
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
        />

        <Button onClick={() => alert('Button clicked!')} leadingIconClassName='fa fa-check'>Click Me</Button>

        <DropdownButton onButtonClick={() => alert('Dropdown Button clicked!')} dropdownItems={[
          { title: "Option 1 and like a whole lot of other stuff", action: () => alert("Option 1 clicked") },
          { title: "Option 2", url: "/option2" },
          { title: "Option 3", action: () => alert("Option 3 clicked") },
          { title: "Option 4" },
        ]}
        showDropdownOnTop={true}
        >Dropdown</DropdownButton>

        <Header className="text-4xl font-bold" style={{ width: "90%", marginBottom: "2rem" }} size={1}>Hello Goldie & Darby</Header>

        <DualPickList
          title="Dual Pick List"
          show={true}
          leftHeader="Available Items"
          rightHeader="Selected Items"
          leftItems={[
            { id: 1, name: "Item 1", selected: false },
            { id: 2, name: "Item 2", selected: false },
            { id: 3, name: "Item 3", selected: false },
          ]}
          rightItems={[
            { id: 4, name: "Item 4", selected: false },
            { id: 5, name: "Item 5", selected: false },
            { id: 6, name: "Item 6", selected: false },
            { id: 7, name: "Item 7", selected: false },
            { id: 8, name: "Item 8", selected: false },
            { id: 9, name: "Item 9", selected: false },
          ]}
          outerContainerStyle={{ width: "90%", border: "1px solid #ccc" }}
        />

        <DualPickList
          title="Dual Pick List"
          show={true}
          leftHeader="Available Items"
          rightHeader="Selected Items"
          leftItems={[
            { id: 1, name: "Item 1", selected: false },
            { id: 2, name: "Item 2", selected: false },
            { id: 3, name: "Item 3", selected: false },
          ]}
          rightItems={[
            { id: 4, name: "Item 4", selected: false },
            { id: 5, name: "Item 5", selected: false },
            { id: 6, name: "Item 6", selected: false },
            { id: 7, name: "Item 7", selected: false },
            { id: 8, name: "Item 8", selected: false },
            { id: 9, name: "Item 9", selected: false },
          ]}
          outerContainerStyle={{ width: "90%", border: "1px solid #ccc" }}
        />

        <TextInput
          onChange={() => {}}
          placeholder="Enter text..."
          leftIconStyle={{ color: "#888" }}
          containerStyle={{ width: "40%", position: "relative", marginTop: "2rem" }}
          inputStyle={{ paddingLeft: "2.25rem", fontSize: "1rem", border: "1px solid #ccc", borderRadius: "4px", outline: "none", width: "100%", boxSizing: "border-box", color: "#000" }}
          // style={{ marginTop: "1rem" }}
        />
      </FlexBox>
    </>
  );
}
// TODO: create a config and use for breakpoint default colors, fonts, etc. for the dev container and other components,
// TODO: page container element that starts with nav and footer
// borders are #ccc, backgrounds are #d8d8d8, icons are #888, text is #000