import type { ReactNode } from "react";
import classNames from "classnames";

type TDataTableProps = {
  children: ReactNode;
  className?: string;
};

export function DataTable({ children, className }: TDataTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)]">
      <div className="overflow-x-auto">
        <table className={classNames("w-full min-w-[880px] text-left text-sm", className)}>
          {children}
        </table>
      </div>
    </div>
  );
}

export function DataTableHead({ children }: TDataTableProps) {
  return (
    <thead className="border-b border-slate-100 bg-[#f4f7fb] text-[11px] font-semibold tracking-wide text-muted uppercase">
      {children}
    </thead>
  );
}

export function DataTableBody({ children }: TDataTableProps) {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>;
}

export function DataTableHeaderCell({
  children,
  className,
}: TDataTableProps) {
  return (
    <th className={classNames("px-4 py-3 whitespace-nowrap", className)}>
      {children}
    </th>
  );
}

export function DataTableCell({ children, className }: TDataTableProps) {
  return (
    <td className={classNames("px-4 py-3.5 align-middle text-ink", className)}>
      {children}
    </td>
  );
}
