//DataTable.jsx
import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import styles from '../../styles/table.module.css'; // Table styles

export default function DataTable({ 
  data, 
  columns, 
  onRowClick,        
  enablePagination = false,
  enableSorting = true,
  enableFilters = false,
  pageSize = 20,
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, columnFilters },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFilters ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    initialState: enablePagination ? { pagination: { pageSize } } : undefined,
  });

  return (
    <div>
      {/* Global search */}
      {enableFilters && (
        <input
          type="text"
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder="Поиск по всей таблице..."
          className={styles.searchInput}
        />
      )}

      {/* Сама таблица */}
      <table className={styles.table}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} className={styles.th}>
                  <div onClick={header.column.getToggleSortingHandler()} style={{ cursor: 'pointer' }}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{ asc: ' 🔼', desc: ' 🔽' }[header.column.getIsSorted()] ?? ''}
                  </div>
                  {/* Фильтр по колонке */}
                  {enableFilters && header.column.getCanFilter() && (
                    <input
                      type="text"
                      value={header.column.getFilterValue() ?? ''}
                      onChange={e => header.column.setFilterValue(e.target.value)}
                      placeholder="Фильтр..."
                      className={styles.columnFilter}
                    />
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
              onClick={() => onRowClick?.(row.original)}
              className={onRowClick ? styles.clickableRow : styles.row}
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

      {/* Pagination */}
      {enablePagination && (
        <div className={styles.pagination}>
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>← Назад</button>
          <span>Стр. {table.getState().pagination.pageIndex + 1} из {table.getPageCount()}</span>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Вперёд →</button>
        </div>
      )}
    </div>
  );
}