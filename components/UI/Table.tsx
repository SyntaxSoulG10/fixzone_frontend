import { ReactNode } from "react";

interface Column {
    header: string;
    accessor: (row: any) => ReactNode;
    className?: string; // Header class
    cellClassName?: string; // Cell class
}

interface TableProps {
    columns: Column[];
    data: any[];
    keyField?: string;
    emptyMessage?: string;
}

export default function Table({ columns, data, keyField = 'id', emptyMessage = 'No data found.' }: TableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-900 font-semibold uppercase tracking-wider text-xs">
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx} className={`px-6 py-4 ${col.className || ''}`}>
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.length > 0 ? (
                        data.map((row) => (
                            <tr key={row[keyField]} className="hover:bg-slate-50 transition-colors">
                                {columns.map((col, idx) => (
                                    <td key={idx} className={`px-6 py-4 ${col.cellClassName || ''}`}>
                                        {col.accessor(row)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500">
                                {emptyMessage}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
