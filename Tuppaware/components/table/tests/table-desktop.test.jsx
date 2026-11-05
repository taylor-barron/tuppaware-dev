import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
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

    it("clicking a header calls onColumnSort(columnIndex)", async () => {
      const user = userEvent.setup();
      const onColumnSort = vi.fn();
      await renderMobile(<MobileHarness onColumnSort={onColumnSort} />);
      await user.click(screen.getByText("Age"));
      expect(onColumnSort).toHaveBeenCalledWith(1);
    });

    it("uses columnSelectIconClass", async () => {
      const { container } = await renderMobile(
        <MobileHarness initialColumns={baseColumns()} rowData={baseRows()} columnSelectIconClass="fa fa-custom-select" />
      );
      await waitFor(() =>
        expect(container.querySelectorAll(".fa-custom-select").length).toBeGreaterThan(0)
      );
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
    it("default sort works in mobile", async () => {
      const user = userEvent.setup();
      const { container } = await renderMobile(<DefaultSortHarness />);
      await user.click(screen.getByText("Name"));
      const names = [...container.querySelectorAll("tbody tr")].map(
        (tr) => tr.querySelector("td").textContent
      );
      expect(names).toEqual(["Alice", "Bob", "Charlie"]);
      expect(screen.getByText("Name").closest("th").querySelector(".fa-caret-up")).toBeInTheDocument();
    });
  });
});