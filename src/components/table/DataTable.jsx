// src/components/table/DataTable.jsx

import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import styles from '../../styles/DataTable.module.css';


function getColWidth(colType) {
  if (colType === 'image') {
    const imgWidth = getComputedStyle(document.documentElement)
      .getPropertyValue('--col-img-width')
      .trim();
    const padding = getComputedStyle(document.documentElement)
      .getPropertyValue('--td-padding')
      .trim();
    return parseInt(imgWidth) + parseInt(padding);
  }
  if (colType === 'checkbox') {
    const cbWidth = getComputedStyle(document.documentElement)
      .getPropertyValue('--col-checkbox-width')
      .trim();
    const padding = getComputedStyle(document.documentElement)
      .getPropertyValue('--td-padding')
      .trim();
    return parseInt(cbWidth) + parseInt(padding);
  }
  return null; // автоширина
}



/**
 * Calculate optimal column width based on the longest value in data.
 */
function calcColumnWidth(accessorKey, header, data, colType, min = 80, max = 300) {
  const fixedWidth = getColWidth(colType);
  if (fixedWidth) return fixedWidth;

  let maxLen = String(header).length;

  data.forEach(row => {
    const val = row[accessorKey];
    const len = val != null ? String(val).length : 0;
    if (len > maxLen) maxLen = len;
  });

  return Math.min(Math.max(maxLen * 8 + 40, min), max);
}

export default function DataTable({
  data = [],
  columns = [],
  onRowClick = null,
  enableSorting = true,
}) {
  const [sorting, setSorting] = useState([]);

  const tableColumns = useMemo(() => {
    return columns.map(col => {
      const width = col.width || calcColumnWidth(col.accessorKey, col.header, data, col.type);

      return {
        accessorKey: col.accessorKey,
        header: col.header,
        enableSorting: col.sortable !== false && enableSorting,
        size: width,
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
                  onClick={(e) => {
                    e.stopPropagation(); // ← остановить всплытие, чтобы onRowClick не сработал
                    if (col.onLinkClick) {
                      col.onLinkClick(rowData);
                    }
                  }}
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
  }, [columns, data, enableSorting]);

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
            <tr key={row.id} className={styles.row}>
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