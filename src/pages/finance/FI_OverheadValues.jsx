// src/pages/finance/FI_OverheadValues.jsx
import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import WideWidget from '../../components/ui/widewidget/WideWidget';
import { UserContext } from '../../context/context';
import { fetchMonthlyOH } from '../../services/api/financeService';
import { fetchOverheadGroups } from '../../services/api/financeService';
import styles from '../../styles/styles.module.css';
import tableStyles from '../../styles/DataTable.module.css';

const MONTHS_TO_SHOW = 4;

const FI_OverheadValues = () => {
  const userdata = useContext(UserContext);
  const token = userdata.userData?.userInfo?.token;
  const userId = userdata.userData?.userInfo?.userId;
  const locale = userdata.userData?.locale || 'RU';

  const [centerDate, setCenterDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  });

  const [rawData, setRawData] = useState([]);
  const [editedValues, setEditedValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groups, setGroups] = useState([]);

  // Загружаем группы один раз
  useEffect(() => {
    fetchOverheadGroups(locale, token)
      .then(setGroups)
      .catch(err => console.error('Ошибка загрузки групп:', err));
  }, []);

  const loadData = async (date) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMonthlyOH({ user_id: userId, date }, token);
      setRawData(data);
      setEditedValues({});
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(centerDate); }, [centerDate]);

  const months = useMemo(() => {
    const m = [];
    const center = new Date(centerDate);
    const start = new Date(center);
    start.setMonth(start.getMonth() - 1);
    for (let i = 0; i < MONTHS_TO_SHOW; i++) {
      const d = new Date(start);
      d.setMonth(d.getMonth() + i);
      m.push(d);
    }
    return m;
  }, [centerDate]);

  const pivot = useMemo(() => {
    const p = {};
    rawData.forEach(r => {
      const cat = r.ohcat_id;
      const mk = r.oh_month?.slice(0, 7);
      if (!p[cat]) p[cat] = {};
      if (!p[cat][mk]) p[cat][mk] = {};
      p[cat][mk][r.platform] = r.oh_amount;
    });
    return p;
  }, [rawData]);

  // Строки с обогащением группой
  const rowData = useMemo(() => {
    const rows = [];
    const cats = [...new Set(rawData.map(r => r.ohcat_id))].sort();

    cats.forEach(cat => {
      const catInfo = rawData.find(r => r.ohcat_id === cat);
      const group = groups.find(g => String(g.id) === String(catInfo?.oh_grp_id));
      rows.push({
        id: `cat-${cat}`,
        ohcat_id: cat,
        ohcat_name: catInfo?.ohcat_name || `Кат. ${cat}`,
        oh_grp_id: catInfo?.oh_grp_id || 0,
        oh_grp_name: group?.oh_grp_name || '',
      });
    });

    return rows.sort((a, b) => {
      if (a.oh_grp_id !== b.oh_grp_id) return a.oh_grp_id - b.oh_grp_id;
      return a.ohcat_name.localeCompare(b.ohcat_name);
    });
  }, [rawData, groups]);

  // Колонки: категория + месяцы с подзаголовками WB/OZON
  const columns = useMemo(() => {
    const cols = [
      {
        accessorKey: 'ohcat_name',
        header: 'Категория',
        cell: ({ getValue }) => <span style={{ fontWeight: 600 }}>{getValue()}</span>,
        size: 200,
      },
    ];

    months.forEach(d => {
      const monthKey = d.toISOString().slice(0, 7);
      const yearLabel = String(d.getFullYear());
      const monthLabel = d.toLocaleDateString('ru-RU', { month: 'long' });

      // WB
      cols.push({
        id: `${monthKey}_WB`,
        header: () => 'WB',
        cell: ({ row }) => {
          const cat = row.original.ohcat_id;
          const editKey = `${cat}_${monthKey}_WB`;
          const value = editKey in editedValues ? editedValues[editKey] : (pivot[cat]?.[monthKey]?.['WB'] || 0);
          return (
            <input
              type="number"
              className={tableStyles.input}
              value={value}
              onChange={(e) => setEditedValues(prev => ({ ...prev, [editKey]: Number(e.target.value) || 0 }))}
            />
          );
        },
        size: 100,
        meta: { monthKey, yearLabel, monthLabel },
      });

      // OZON
      cols.push({
        id: `${monthKey}_OZON`,
        header: () => 'OZON',
        cell: ({ row }) => {
          const cat = row.original.ohcat_id;
          const editKey = `${cat}_${monthKey}_OZON`;
          const value = editKey in editedValues ? editedValues[editKey] : (pivot[cat]?.[monthKey]?.['OZON'] || 0);
          return (
            <input
              type="number"
              className={tableStyles.input}
              value={value}
              onChange={(e) => setEditedValues(prev => ({ ...prev, [editKey]: Number(e.target.value) || 0 }))}
            />
          );
        },
        size: 100,
        meta: { monthKey, yearLabel, monthLabel },
      });
    });

    return cols;
  }, [months, pivot, editedValues]);

  // Группируем колонки для объединённых заголовков (год + месяц)
  const headerGroups = useMemo(() => {
    const groups = [];
    let colIndex = 1; // после категории

    months.forEach(d => {
      const yearLabel = String(d.getFullYear());
      const monthLabel = d.toLocaleDateString('ru-RU', { month: 'long' });

      groups.push({
        label: `${yearLabel}`,
        colSpan: 2,
        subLabel: monthLabel,
        startCol: colIndex,
      });
      colIndex += 2;
    });

    return groups;
  }, [months]);

  const changeMonth = (delta) => {
    const d = new Date(centerDate);
    d.setMonth(d.getMonth() + delta);
    setCenterDate(d.toISOString().slice(0, 10));
  };

  // Разделители групп
  const renderGroupSeparator = useCallback((row, index, rows) => {
    if (index === 0 || row.oh_grp_id !== rows[index - 1].oh_grp_id) {
      const grpName = row.oh_grp_name || 'Без группы';
      return (
        <tr key={`grp-${row.id}`}>
          <td colSpan={columns.length} className={tableStyles.td} style={{ background: '#e0e0e0', fontWeight: 'bold', textAlign: 'center', padding: '8px' }}>
            {grpName}
          </td>
        </tr>
      );
    }
    return null;
  }, [columns.length]);

  if (loading) return (
    <WideWidget title="Значения накладных расходов">
      <div className={styles.contentCentered}>Загрузка...</div>
    </WideWidget>
  );

  return (
    <WideWidget title="Значения накладных расходов">
      <div className={styles.contentCentered}>
        {error && <div className={styles.error}>Ошибка: {error}</div>}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <button onClick={() => changeMonth(-1)} className={styles.centeredButton}>← Раньше</button>
          <span style={{ fontWeight: 'bold' }}>
            {months[0]?.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })} — {months[months.length - 1]?.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => changeMonth(1)} className={styles.centeredButton}>Позже →</button>
        </div>

        <div className={tableStyles.wrapper}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th className={tableStyles.th} rowSpan={2}>Категория</th>
                {months.map((d, i) => (
                  <th
                    key={`month-${d.toISOString()}`}
                    colSpan={2}
                    className={`${tableStyles.th} ${i > 0 ? tableStyles.monthDivider : ''}`}
                    style={{ textAlign: 'center' }}
                  >
                    {d.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                  </th>
                ))}
              </tr>
              <tr>
                {months.map((d, i) => (
                  <React.Fragment key={`plat-${d.toISOString()}`}>
                    <th className={`${tableStyles.th} ${tableStyles.platformHeader} ${i > 0 ? tableStyles.monthDivider : ''} ${tableStyles.wbCell}`}>WB</th>
                    <th className={`${tableStyles.th} ${tableStyles.platformHeader} ${tableStyles.ozonCell}`}>OZON</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {rowData.map((row, index) => (
                <React.Fragment key={row.id}>
                  {renderGroupSeparator(row, index, rowData)}
                  <tr className={tableStyles.row}>
                    <td className={tableStyles.td} style={{ fontWeight: 600 }}>{row.ohcat_name}</td>
                    {months.map((d, i) => {
                      const mk = d.toISOString().slice(0, 7);
                      const cat = row.ohcat_id;
                      const wbKey = `${cat}_${mk}_WB`;
                      const ozKey = `${cat}_${mk}_OZON`;
                      const wbVal = wbKey in editedValues ? editedValues[wbKey] : (pivot[cat]?.[mk]?.['WB'] || 0);
                      const ozVal = ozKey in editedValues ? editedValues[ozKey] : (pivot[cat]?.[mk]?.['OZON'] || 0);

                      return (
                        <React.Fragment key={`${cat}-${mk}`}>
                          <td className={`${tableStyles.td} ${tableStyles.wbCell} ${i > 0 ? tableStyles.monthDivider : ''}`}>
                            <input type="number" className={tableStyles.input} value={wbVal}
                              onChange={(e) => setEditedValues(prev => ({ ...prev, [wbKey]: Number(e.target.value) || 0 }))} />
                          </td>
                          <td className={`${tableStyles.td} ${tableStyles.ozonCell}`}>
                            <input type="number" className={tableStyles.input} value={ozVal}
                              onChange={(e) => setEditedValues(prev => ({ ...prev, [ozKey]: Number(e.target.value) || 0 }))} />
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </WideWidget>
  );
};

export default FI_OverheadValues;