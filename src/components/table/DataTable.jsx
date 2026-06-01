// src/components/table/DataTable.jsx

import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import styles from '../../styles/DataTable.module.css';

/**
 * Universal data table built on TanStack Table.
 *
 * Column shape (from buildTableConfig):
 * {
 *   accessorKey: string,
 *   header:      string,
 *   type:        'text' | 'number' | 'checkbox' | 'image' | 'link' | 'date' | 'custom',
 *   editable?:   boolean,
 *   width?:      number,
 *   sortable?:   boolean,
 *   onChange?:   (value, row) => void,
 *   onLinkClick?:(row) => void,
 *   cellRender?: (value, row) => JSX,   // for type 'custom'
 * }
 */
export default function DataTable({
  data = [],
  columns = [],
  onRowClick = null,
  enableSorting = true,
}) {
  const [sorting, setSorting] = useState([]);

  const tableColumns = useMemo(() => {
    return columns.map(col => {
      // Auto-width: header length * 10 + padding, clamped between 80 and 300
      const headerLen = String(col.header).length;
      const autoWidth = Math.min(Math.max(headerLen * 10 + 30, 80), 300);

      return {
        accessorKey: col.accessorKey,
        header: col.header,
        enableSorting: col.sortable !== false && enableSorting,
        size: col.width || autoWidth,
        cell: ({ getValue, row }) => {
          const value = getValue();
          const rowData = row.original;

          switch (col.type) {
            case 'checkbox':
              return (
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={!!value}
                  onChange={(e) => col.onChange?.(e.target.checked, rowData)}
                />
              );

            case 'image':
              return value ? <img src={value} alt="" className={styles.img} /> : null;

            case 'link':
              return (
                <span
                  className={styles.link}
                  onClick={() => col.onLinkClick?.(rowData)}
                >
                  {value}
                </span>
              );

            case 'number':
              if (col.editable) {
                return (
                  <input
                    type="number"
                    className={styles.input}
                    value={value ?? ''}
                    onChange={(e) => col.onChange?.(Number(e.target.value), rowData)}
                  />
                );
              }
              return value;

            case 'custom':
              return col.cellRender ? col.cellRender(value, rowData) : value;

            case 'text':
            default:
              if (col.editable) {
                return (
                  <input
                    type="text"
                    className={styles.input}
                    value={value ?? ''}
                    onChange={(e) => col.onChange?.(e.target.value, rowData)}
                  />
                );
              }
              return value;
          }
        },
      };
    });
  }, [columns, enableSorting]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
  });

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className={styles.th}
                  style={{ width: header.column.columnDef.size }}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getIsSorted() && (
                    <span className={styles.sortIcon}>
                      {header.column.getIsSorted() === 'asc' ? ' 🔼' : ' 🔽'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr
              key={row.id}
              className={onRowClick ? styles.clickableRow : styles.row}
              onClick={() => onRowClick?.(row.original)}
            >
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className={styles.td}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}