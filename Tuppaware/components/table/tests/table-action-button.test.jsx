import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Table from "../table";
import {
  baseColumns,
  baseRows,
  renderMobile,
  stableActionColumn,
  useTableTestEnvironment,
} from "./table-test-utils";

const rowMatcher = expect.objectContaining({ data: { name: "Taylor", age: "32" } });

describe("table-action-button.jsx", () => {
  useTableTestEnvironment();

  const renderWithActions = (props) =>
    render(
      <Table
        columns={baseColumns()}
        rowData={baseRows()}
        useActionsColumn
        actionColumn={stableActionColumn}
        {...props}
      />
    );

  describe("visibility", () => {
    it("renders no action cell when useActionsColumn is false", () => {
      render(<Table columns={baseColumns()} rowData={baseRows()} useActionsColumn={false} />);
      expect(screen.queryByText("Actions")).not.toBeInTheDocument();
    });
    it("renders the action header when useActionsColumn is true", () => {
      renderWithActions({});
      expect(screen.getByText("Actions")).toBeInTheDocument();
    });
  });

  describe("action button", () => {
    it("displays text and icons", () => {
      const { container } = renderWithActions({
        useActionButton: true,
        actionButtonData: {
          text: "Edit",
          leadingIconClassName: "fa fa-pencil",
          trailingIconClassName: "fa fa-angle-right",
        },
      });
      expect(screen.getByText("Edit")).toBeInTheDocument();
      expect(container.querySelector(".fa-pencil")).toBeInTheDocument();
      expect(container.querySelector(".fa-angle-right")).toBeInTheDocument();
    });

    it("runs onClick with row + rowIndex and stops row click", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onRowClick = vi.fn();
      renderWithActions({
        useActionButton: true,
        actionButtonData: { text: "Edit", onClick },
        onRowClick,
      });
      await user.click(screen.getByText("Edit"));
      await new Promise((r) => setTimeout(r, 50));
      expect(onClick).toHaveBeenCalledWith(rowMatcher, 0);
      expect(onRowClick).not.toHaveBeenCalled();
    });

    it("does not throw without onClick", async () => {
      const user = userEvent.setup();
      renderWithActions({ useActionButton: true, actionButtonData: { text: "Edit" } });
      await user.click(screen.getByText("Edit"));
    });
  });

  describe("dropdown button", () => {
    const dropdownData = (extra = {}) => ({
      text: "More",
      dropdownItems: [{ title: "Option 1", action: vi.fn() }],
      ...extra,
    });

    it("opens from the caret", async () => {
      const user = userEvent.setup();
      const { container } = renderWithActions({
        useDropdownButton: true,
        dropdownButtonData: dropdownData(),
      });
      await user.click(container.querySelector(".fa-caret-down"));
      expect(screen.getByText("Option 1")).toBeInTheDocument();
    });

    it("runs onButtonClick with row + rowIndex", async () => {
      const user = userEvent.setup();
      const onButtonClick = vi.fn();
      renderWithActions({
        useDropdownButton: true,
        dropdownButtonData: dropdownData({ onButtonClick }),
      });
      await user.click(screen.getByText("More"));
      expect(onButtonClick).toHaveBeenCalledWith(rowMatcher, 0);
    });

    it("binds dropdown item actions to row + rowIndex", async () => {
      const user = userEvent.setup();
      const action = vi.fn();
      const { container } = renderWithActions({
        useDropdownButton: true,
        dropdownButtonData: dropdownData({ dropdownItems: [{ title: "Option 2", action }] }),
      });
      await user.click(container.querySelector(".fa-caret-down"));
      await user.click(screen.getByText("Option 2"));
      expect(action).toHaveBeenCalledWith(rowMatcher, 0);
    });

    it("takes priority over the action button", () => {
      renderWithActions({
        useActionButton: true,
        actionButtonData: { text: "Edit" },
        useDropdownButton: true,
        dropdownButtonData: dropdownData(),
      });
      expect(screen.getByText("More")).toBeInTheDocument();
      expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    });
  });

  describe("cell styling", () => {
    it("applies the row background to the action cell (desktop)", () => {
      const { container } = renderWithActions({
        useActionButton: true,
        actionButtonData: { text: "Edit" },
        evenRowStyle: { backgroundColor: "rgb(255, 192, 203)" },
      });
      const cells = container.querySelectorAll("tbody tr td");
      expect(cells[cells.length - 1]).toHaveStyle("background-color: rgb(255, 192, 203)");
    });

    it("applies the row background to the action cell (mobile)", async () => {
      const { container } = await renderMobile(
        <Table
          columns={baseColumns()}
          rowData={baseRows()}
          useActionsColumn
          actionColumn={stableActionColumn}
          useActionButton
          actionButtonData={{ text: "Edit" }}
          evenRowStyle={{ backgroundColor: "rgb(255, 192, 203)" }}
        />
      );
      const cells = container.querySelectorAll("tbody tr td");
      expect(cells[cells.length - 1]).toHaveStyle("background-color: rgb(255, 192, 203)");
    });
  });
});