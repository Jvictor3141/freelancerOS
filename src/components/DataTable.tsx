import type { ReactNode } from 'react';

type Column<T> = {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  title: string;
  description: string;
  columns: Column<T>[];
  data: T[];
};

export function DataTable<T>({ title, description, columns, data }: DataTableProps<T>) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-100">
      <div className="border-b border-slate-200 px-6 py-5">
        <p className="text-sm font-medium text-slate-500">{description}</p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">{title}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              {columns.map((column) => (
                <th key={column.header} className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 ${column.className ?? ''}`}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="border-b border-slate-100 transition hover:bg-slate-50/70">
                {columns.map((column) => (
                  <td key={column.header} className={`px-6 py-4 text-sm text-slate-700 ${column.className ?? ''}`}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
