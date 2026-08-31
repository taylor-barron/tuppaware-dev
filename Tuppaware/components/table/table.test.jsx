import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Table from "./table";

describe("Table", () => {
  it("renders headers and row data", () => {
    render(
      <Table
        columns={[{ name: "Name" }, { name: "Age" }]}
        rowData={[{ data: ["Taylor", "32"] }]}
        useActionsColumn={false}
      />
    );

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();
    expect(screen.getByText("Taylor")).toBeInTheDocument();
    expect(screen.getByText("32")).toBeInTheDocument();
  });

  it("calls onRowClick with row and rowIndex", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();

    render(
      <Table
        columns={[{ name: "Name" }, { name: "Age" }]}
        rowData={[{ data: ["Taylor", "32"] }]}
        useActionsColumn={false}
        onRowClick={onRowClick}
      />
    );

    await user.click(screen.getByText("Taylor"));
    expect(onRowClick).toHaveBeenCalledWith({ data: ["Taylor", "32"] }, 0);
  });
});