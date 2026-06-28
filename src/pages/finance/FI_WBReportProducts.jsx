import React, { useState, useEffect, useContext, useMemo, useCallback  } from 'react';
import WideWidget from '../../components/ui/widewidget/WideWidget';
import DataTable from '../../components/table/DataTable';
import { UserContext } from '../../context/context';
import { fetchWBReportProducts } from '../../services/api/financeService';
import { sortGroupedData, createGroupSeparator } from '../../utils/sortAndGroup';
import styles from '../../styles/styles.module.css';
import { translateFieldValues } from '../../utils/tableHelpers';

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
      const sortedReports = [...(data.reports || [])].sort((a, b) => Number(a.id) - Number(b.id));
      setReports(sortedReports || []);
      const filteredRows = (data.rows || []).filter(row => row.field !== 'report_id');
      const translatedRows = await translateFieldValues(filteredRows, 'field', locale, token);
      setRows(translatedRows);

      // Строим колонки
      const cols = [
        {
          accessorKey: 'field',
          header: 'Показатель',
          type: 'text',
          width: 200,
        },
        ...(data.reports || [])
            .map(r => ({
            accessorKey: r.id,
            header: r.label,
            type: 'custom',
            cellRender: (_, row) => {
                const val = row.values?.[r.id];
                return val != null ? Number(val).toLocaleString('ru-RU') : '';
            },
        })),
      ];
      setColumns(cols);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Сортировка и разделители
    const sortedRows = useMemo(() => {
    if (rows.length === 0) return [];
    return sortGroupedData(rows, [
        { key: 'goods_type_name', type: 'string' },
        { key: 'goods_grp_name', type: 'string' },
        { key: 'vendorcode', type: 'string' },
        { key: 'title', type: 'string' },
    ]);
    }, [rows]);

    const renderSeparator = useCallback((row, index, rows) => {
    const prev = rows[index - 1];
    const fragments = [];

    const groups = [
        { key: 'goods_type_name', background: '#d0d0d0', padding: '8px', fontWeight: 'bold' },
        { key: 'goods_grp_name', background: '#e8e8e8', padding: '6px', fontWeight: 'normal' },
        { key: 'vendorcode', background: '#f5f5f5', padding: '4px', fontWeight: 'normal', format: (r) => `${r.vendorcode}: ${r.title}` },
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
                fontWeight: group.fontWeight,
                padding: group.padding,
                background: group.background,
            }}>
                {group.format ? group.format(row) : row[group.key] || 'Без'}
            </td>
            </tr>
        );

        // После разделителя товара — строка с номерами недель
        if (group.key === 'vendorcode') {
            fragments.push(
            <tr key={`weeks-${row.vendorcode}`}>
                <td style={{ textAlign: 'left', padding: '2px 8px', fontSize: 12, color: '#888' }}></td>
                {reports.map(r => (
                <td key={r.id} style={{ textAlign: 'center', fontSize: 11, color: '#888', padding: '2px 4px' }}>
                    {r.report_week && <div>{r.report_week}</div>}
                    {r.report_dates && <div>{r.report_dates}</div>}
                </td>
                ))}
            </tr>
            );
        }
        }
    });

    return <>{fragments}</>;
    }, [columns.length, reports]);

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
          <DataTable
            data={sortedRows}
            columns={columns}
            renderRowBefore={renderSeparator}
          />
        ) : (
          !error && <p>Нет данных</p>
        )}
      </div>
    </WideWidget>
  );
};

export default FI_WBReportProducts;