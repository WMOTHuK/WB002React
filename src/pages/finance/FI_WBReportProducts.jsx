import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import WideWidget from '../../components/ui/widewidget/WideWidget';
import { UserContext } from '../../context/context';
import { fetchWBReportProducts } from '../../services/api/financeService';
import { translateFieldValues, enrichWithQuantities } from '../../utils/tableHelpers';
import { sortGroupedData } from '../../utils/sortAndGroup';
import styles from '../../styles/styles.module.css';
import tableStyles from '../../styles/DataTable.module.css';

const FI_WBReportProducts = () => {
  const userdata = useContext(UserContext);
  const token = userdata.userData?.userInfo?.token;
  const locale = userdata.userData?.locale || 'RU';

  const [reports, setReports] = useState([]);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchWBReportProducts(4, token);

      // Сортируем отчёты от старых к новым
      const sortedReports = [...(data.reports || [])].sort((a, b) => Number(a.id) - Number(b.id));
      setReports(sortedReports);

      // Фильтруем строки
      const filteredRows = (data.rows || []).filter(row => row.field !== 'report_id');

      // Переводим field
      const translatedRows = await translateFieldValues(filteredRows, 'field', locale, token);

      // Обогащаем quantity
      const enrichedRows = enrichWithQuantities(translatedRows, 'Количество');
      setRows(enrichedRows);

      // Строим колонки
      const cols = [
        {
          accessorKey: 'field',
          header: 'Показатель',
          cell: ({ getValue }) => getValue(),
        },
        ...sortedReports.flatMap(r => [
          {
            accessorKey: r.id,
            header: 'Общее',
            cell: ({ row }) => {
              const val = row.original.values?.[r.id];
              return val != null ? Number(val).toLocaleString('ru-RU') : '';
            },
          },
          {
            accessorKey: `${r.id}_per_unit`,
            header: 'На ед.',
            cell: ({ row }) => {
              const val = row.original.values?.[r.id];
              if (val == null) return '';
              if (row.original.field === 'Количество') return '';
              const qty = Number(row.original._quantities?.[r.id] || 0);
              if (!qty || qty === 0) return Number(val).toLocaleString('ru-RU');
              return (Number(val) / qty).toLocaleString('ru-RU', { maximumFractionDigits: 2 });
            },
          },
        ]),
      ];
      setColumns(cols);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Сортировка данных
  const sortedRows = useMemo(() => {
    if (rows.length === 0) return [];
    return sortGroupedData(rows, [
      { key: 'goods_type_name', type: 'string' },
      { key: 'goods_grp_name', type: 'string' },
      { key: 'vendorcode', type: 'string' },
      { key: 'title', type: 'string' },
    ]);
  }, [rows]);

  // Разделители
  const renderSeparator = useCallback((row, index, rowsArr) => {
    const prev = rowsArr[index - 1];
    const fragments = [];

    const groups = [
      { key: 'goods_type_name', background: '#d0d0d0', padding: '8px', fontWeight: 'bold' },
      { key: 'goods_grp_name', background: '#e8e8e8', padding: '6px' },
      { key: 'vendorcode', background: '#f5f5f5', padding: '4px', format: (r) => `${r.vendorcode}: ${r.title}` },
    ];

    groups.forEach(group => {
      const isFirst = index === 0;
      const changed = isFirst || row[group.key] !== prev?.[group.key];
      const parentChanged = groups.slice(0, groups.findIndex(g => g.key === group.key)).some(g =>
        isFirst || row[g.key] !== prev?.[g.key]
      );

      if (changed || parentChanged) {
        fragments.push(
          <tr key={`sep-${group.key}-${row.vendorcode}-${row.field}`}>
            <td colSpan={columns.length} style={{
              textAlign: 'left',
              fontWeight: group.fontWeight || 'normal',
              padding: group.padding,
              background: group.background,
            }}>
              {group.format ? group.format(row) : row[group.key] || 'Без'}
            </td>
          </tr>
        );

        // После разделителя товара — строка с неделями
        if (group.key === 'vendorcode') {
          fragments.push(
            <tr key={`weeks-${row.vendorcode}`}>
              <td style={{ textAlign: 'left', padding: '2px 8px', fontSize: 12, color: '#888' }}></td>
              {reports.map(r => (
                <td key={`week-${r.id}`} colSpan={2} style={{ textAlign: 'center', fontSize: 11, color: '#888', padding: '2px 4px' }}>
                  <div>{r.report_week}</div>
                  <div>{r.report_dates}</div>
                </td>
              ))}
            </tr>
          );
        }
      }
    });

    return <>{fragments}</>;
  }, [columns.length, reports]);

  // Таблица
  const table = useReactTable({
    data: sortedRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) return (
    <WideWidget title="WB сводка по товарам">
      <div className={styles.contentCentered}>Загрузка...</div>
    </WideWidget>
  );

  return (
    <WideWidget title="WB сводка по товарам">
      <div className={styles.contentCentered}>
        {error && <div className={styles.error}>Ошибка: {error}</div>}

        {sortedRows.length > 0 ? (
          <div className={tableStyles.wrapper}>
            <table className={tableStyles.table}>
              {/* Заголовки */}
              <thead>
                <tr>
                  <th className={tableStyles.th} rowSpan={2}>Показатель</th>
                  {reports.map(r => (
                    <th key={r.id} colSpan={2} className={tableStyles.th} style={{ textAlign: 'center' }}>
                      <div>{r.report_week}</div>
                      <div style={{ fontSize: 10, color: '#888' }}>{r.report_dates}</div>
                    </th>
                  ))}
                </tr>
                <tr>
                  {reports.flatMap(r => [
                    <th key={`${r.id}_total`} className={tableStyles.th} style={{ textAlign: 'center' }}>Общее</th>,
                    <th key={`${r.id}_per_unit`} className={tableStyles.th} style={{ textAlign: 'center' }}>На ед.</th>,
                  ])}
                </tr>
              </thead>
              {/* Тело */}
              <tbody>
                {table.getRowModel().rows.map((row, index) => (
                  <React.Fragment key={row.id}>
                    {renderSeparator(row.original, index, sortedRows)}
                    <tr className={tableStyles.row}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className={tableStyles.td}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !error && <p>Нет данных</p>
        )}
      </div>
    </WideWidget>
  );
};

export default FI_WBReportProducts;