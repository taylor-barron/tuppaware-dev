import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Table from "../table";
import {
  DefaultSortHarness,
  MobileHarness,
  baseColumns,
  baseRows,
  renderMobile,
  stableActionColumn,
  threeColumns,
  useTableTestEnvironment,
} from "./table-test-utils";

const headerOf = (name) => screen.getByText(name).closest("th");

const sortIconOf = (name) => {
  const th = headerOf(name);
  return (
    th.querySelector(".fa-caret-up") ||
    th.querySelector(".fa-caret-down") ||
    th.querySelector(".fa-sort")
  );
};

describe("table-mobile.jsx", () => {
  useTableTestEnvironment();

  const headerNames = (container) =>
    [...container.querySelectorAll("thead th")].map((th) => th.textContent.trim());

  describe("initial state", () => {
    it("switches to mobile layout below the breakpoint", async () => {
      const desktop = render(<Table columns={baseColumns()} rowData={baseRows()} />);
      expect(desktop.container.querySelector(".fa-bars")).not.toBeInTheDocument();
      desktop.unmount();

      const { container } = await renderMobile(
        <MobileHarness initialColumns={baseColumns()} rowData={baseRows()} />
      );
      expect(container.querySelector(".fa-bars")).toBeInTheDocument();
    });

    it("normalizes selections via setColumns when none are selected", async () => {
      const onColumnsSet = vi.fn();
      await renderMobile(<MobileHarness onColumnsSet={onColumnsSet} />);
      await waitFor(() => expect(onColumnsSet).toHaveBeenCalled());
      expect(onColumnsSet.mock.calls[0][0].map((c) => !!c.selected)).toEqual([true, true, false]);
    });

    it("does not re-call setColumns once normalized", async () => {
      const onColumnsSet = vi.fn();
      await renderMobile(<MobileHarness onColumnsSet={onColumnsSet} />);
      await waitFor(() => expect(onColumnsSet).toHaveBeenCalled());
      const calls = onColumnsSet.mock.calls.length;
      await new Promise((r) => setTimeout(r, 50));
      expect(onColumnsSet.mock.calls.length).toBe(calls);
    });
  });

  describe("header", () => {
    it("only selected columns render a <th>", async () => {
      const { container } = await renderMobile(<MobileHarness />);
      expect(screen.queryByText("Location")).not.toBeInTheDocument();
      expect(headerNames(container)).toEqual(["Name", "Age"]);
    });

    it("renders the action <th> only when shown", async () => {
      await renderMobile(<MobileHarness useActionsColumn actionColumn={stableActionColumn} />);
      expect(screen.getByText("Actions")).toBeInTheDocument();
    });

    it("hides the action <th> when maxMobileColumns leaves no room", async () => {
      // 2 data columns selected + maxMobileColumns=1 → action column cannot fit.
      await renderMobile(
        <MobileHarness useActionsColumn actionColumn={stableActionColumn} maxMobileColumns={1} />
      );
      expect(screen.queryByText("Actions")).not.toBeInTheDocument();
    });

    it("clicking the sort icon calls onColumnSort(columnIndex)", async () => {
      const user = userEvent.setup();
      const onColumnSort = vi.fn();
      await renderMobile(<MobileHarness onColumnSort={onColumnSort} />);

      await user.click(sortIconOf("Age"));
      expect(onColumnSort).toHaveBeenCalledWith(1);
    });

    it("clicking the sort icon in a sorted column calls onColumnSort with that column", async () => {
      const user = userEvent.setup();
      const onColumnSort = vi.fn();
      await renderMobile(
        <MobileHarness
          initialColumns={[
            { name: "Name", mapto: "name", selected: true, sort: "asc" },
            { name: "Age", mapto: "age", selected: true },
          ]}
          onColumnSort={onColumnSort}
        />
      );

      const icon = headerOf("Name").querySelector(".fa-caret-up");
      expect(icon).toBeInTheDocument();
      await user.click(icon);
      expect(onColumnSort).toHaveBeenCalledWith(0);
    });

    it("clicking the column-select icon does not sort", async () => {
      const user = userEvent.setup();
      const onColumnSort = vi.fn();
      const { container } = await renderMobile(<MobileHarness onColumnSort={onColumnSort} />);

      const selectIcon = container.querySelector("thead .fa-bars");
      expect(selectIcon).toBeInTheDocument();
      await user.click(selectIcon);

      expect(onColumnSort).not.toHaveBeenCalled();
    });

    it("uses columnSelectIconClass", async () => {
      const { container } = await renderMobile(
        <MobileHarness
          initialColumns={baseColumns()}
          rowData={baseRows()}
          columnSelectIconClass="fa fa-custom-select"
        />,
        ".fa-custom-select"
      );
      expect(container.querySelector(".fa-custom-select")).toBeInTheDocument();
    });
  });

  describe("body", () => {
    it("only selected columns render cells", async () => {
      const { container } = await renderMobile(<MobileHarness />);
      const firstRowCells = container.querySelectorAll("tbody tr")[0].querySelectorAll("td");
      expect(firstRowCells).toHaveLength(2);
      expect(screen.queryByText("NYC")).not.toBeInTheDocument();
    });

    it("even/odd row styles apply to rows and cells", async () => {
      const { container } = await renderMobile(<MobileHarness />);
      const rows = container.querySelectorAll("tbody tr");
      expect(rows[0]).toHaveStyle("background-color: rgb(249, 249, 249)");
      expect(rows[0].querySelector("td")).toHaveStyle("background-color: rgb(249, 249, 249)");
      expect(rows[1]).toHaveStyle("background-color: rgb(255, 255, 255)");
    });

    it("applies selected style after a click", async () => {
      const user = userEvent.setup();
      const { container } = await renderMobile(<MobileHarness />);
      await user.click(screen.getByText("Alice"));
      const row = container.querySelectorAll("tbody tr")[1];
      expect(row).toHaveStyle("background-color: rgb(217, 237, 247)");
      expect(row.querySelector("td")).toHaveStyle("background-color: rgb(217, 237, 247)");
    });

    it("calls onRowClick with row and rowIndex", async () => {
      const user = userEvent.setup();
      const onRowClick = vi.fn();
      await renderMobile(<MobileHarness onRowClick={onRowClick} />);
      await user.click(screen.getByText("Bob"));
      await waitFor(() =>
        expect(onRowClick).toHaveBeenCalledWith(
          expect.objectContaining({ data: expect.objectContaining({ name: "Bob" }) }),
          2
        )
      );
    });
  });

  describe("add column tab", () => {
    it("shown while below max, opens modal on click", async () => {
      const user = userEvent.setup();
      const { container } = await renderMobile(<MobileHarness />);
      const addIcon = container.querySelector(".fa-plus");
      expect(addIcon).toBeInTheDocument();
      await user.click(addIcon);
      expect(await screen.findByText("Location")).toBeInTheDocument();
    });

    it("hidden once maxMobileColumns is reached", async () => {
      const { container } = await renderMobile(<MobileHarness maxMobileColumns={2} />);
      expect(container.querySelector(".fa-plus")).not.toBeInTheDocument();
    });

    it("reserves a slot for the visible action column", async () => {
      const { container } = await renderMobile(
        <MobileHarness useActionsColumn actionColumn={stableActionColumn} maxMobileColumns={2} />
      );
      // action column + 1 data column already fills the 2 slots
      expect(container.querySelector(".fa-plus")).not.toBeInTheDocument();
    });

    it("uses columnAddIconClass and add-column container style", async () => {
      const { container } = await renderMobile(
        <MobileHarness
          columnAddIconClass="fa fa-custom-add"
          addColumnIconContainerStyle={{ backgroundColor: "rgb(255, 0, 0)" }}
        />
      );
      expect(container.querySelector(".fa-custom-add")).toBeInTheDocument();
    });
  });

  describe("modal and selection", () => {
    it("lists unselected columns", async () => {
      const user = userEvent.setup();
      const { container } = await renderMobile(<MobileHarness />);
      await user.click(container.querySelector(".fa-plus"));
      expect(await screen.findByText("Location")).toBeInTheDocument();
    });

    it("lists the action column when enabled but not shown", async () => {
      const user = userEvent.setup();
      // maxMobileColumns=1 forces action column to be hidden despite the flag.
      const { container } = await renderMobile(
        <MobileHarness useActionsColumn actionColumn={stableActionColumn} maxMobileColumns={1} />
      );
      expect(screen.queryByText("Actions")).not.toBeInTheDocument();
      await user.click(container.querySelector("thead .fa-bars"));
      expect(await screen.findAllByText(/Actions/)).not.toHaveLength(0);
    });

    it("offers Remove options when >1 selected", async () => {
      const user = userEvent.setup();
      const { container } = await renderMobile(<MobileHarness />);
      await user.click(container.querySelector("thead .fa-bars"));
      expect(await screen.findAllByText(/Remove/)).not.toHaveLength(0);
    });

    it("selection swaps flags by mapto, calls setColumns, closes modal", async () => {
      const user = userEvent.setup();
      const onColumnsSet = vi.fn();
      const { container } = await renderMobile(<MobileHarness onColumnsSet={onColumnsSet} />);
      await user.click(container.querySelector(".fa-plus"));
      await user.click(await screen.findByText("Location"));

      await waitFor(() => expect(screen.getAllByText("Location").length).toBeGreaterThan(0));
      const last = onColumnsSet.mock.calls.at(-1)[0];
      expect(last.find((c) => c.mapto === "location").selected).toBe(true);
      expect(headerNames(container)).toContain("Location");
    });

    it("can be reopened after closing", async () => {
      const user = userEvent.setup();
      const { container } = await renderMobile(<MobileHarness maxMobileColumns={5} />);
      await user.click(container.querySelector(".fa-plus"));
      await user.click(await screen.findByText("Location"));
      await user.click(container.querySelector("thead .fa-bars"));
      expect(await screen.findAllByText(/Remove/)).not.toHaveLength(0);
    });

    it("does not mutate columns", async () => {
      const user = userEvent.setup();
      const frozen = threeColumns().map((c) => Object.freeze({ ...c }));
      const { container } = await renderMobile(<MobileHarness initialColumns={frozen} />);
      await user.click(container.querySelector(".fa-plus"));
      expect(frozen.every((c) => !("selected" in c))).toBe(true);
    });
  });

  describe("sorting", () => {
    it("default sort works in mobile when the sort icon is clicked", async () => {
      const user = userEvent.setup();
      const { container } = await renderMobile(<DefaultSortHarness />);

      expect(headerOf("Name").querySelector(".fa-sort")).toBeInTheDocument();
      await user.click(sortIconOf("Name"));

      const names = [...container.querySelectorAll("tbody tr")].map(
        (tr) => tr.querySelector("td").textContent
      );
      expect(names).toEqual(["Alice", "Bob", "Charlie"]);
      expect(headerOf("Name").querySelector(".fa-caret-up")).toBeInTheDocument();
    });

    it("cycles icon and order: asc → desc → none", async () => {
      const user = userEvent.setup();
      const { container } = await renderMobile(<DefaultSortHarness />);
      const names = () =>
        [...container.querySelectorAll("tbody tr")].map((tr) => tr.querySelector("td").textContent);

      await user.click(sortIconOf("Name"));
      expect(names()).toEqual(["Alice", "Bob", "Charlie"]);
      expect(headerOf("Name").querySelector(".fa-caret-up")).toBeInTheDocument();

      await user.click(headerOf("Name").querySelector(".fa-caret-up"));
      expect(names()).toEqual(["Charlie", "Bob", "Alice"]);
      expect(headerOf("Name").querySelector(".fa-caret-down")).toBeInTheDocument();

      await user.click(headerOf("Name").querySelector(".fa-caret-down"));
      expect(names()).toEqual(["Charlie", "Alice", "Bob"]);
      expect(headerOf("Name").querySelector(".fa-sort")).toBeInTheDocument();
    });
  });
});