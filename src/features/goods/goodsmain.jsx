// src/features/goods/GoodsMain.jsx

import React, { useState, useEffect, useContext, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/styles.module.css';
import DataTable from '../../components/table/DataTable';
import { UserContext } from '../../context/context';
import { downloadGoodsData, saveGoodsRow, fetchGoodsGroups, syncUserGoods } from '../../services/api/goodsService';
import { useTableConfig } from '../../hooks/useTableConfig';
import { useRowSave } from '../../hooks/useRowSave';
import { changeGoodsGroup } from '../../services/api/goodsService';
import StatusMessage from '../../components/ui/StatusMessage';

const GoodsMain = () => {
  const [syncResult, setSyncResult] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const [status, setStatus] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userdata = useContext(UserContext);
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]); // для дроп-дауна и разделителей

  const {
    columns: baseColumns,
    loading: configLoading,
    error: configError,
    buildConfig,
  } = useTableConfig(navigate, userdata.userData?.locale, 'edit', userdata.userData?.userInfo?.token);

  // Храним оригинальные данные для сравнения изменений
  const originalDataRef = useRef([]);

  // Кастомная функция сохранения
  const handleSaveRow = useCallback(async (row) => {
    const originalRow = originalDataRef.current.find(r => r.vendorcode === row.vendorcode);
    return saveGoodsRow(row, originalRow, userdata.userData?.userInfo?.token);
  }, [userdata]);

  const { markChanged, actionsColumn } = useRowSave({
    saveFn: handleSaveRow,
    getRowId: (row) => row.vendorcode,
  });

  const handleCellChange = useCallback((field, value, row) => {
    console.log('handleCellChange called:', field, value, row.vendorcode);
    // Сначала обновляем локальные данные
    setTableData(prev => {
      const newData = prev.map(item =>
        item.vendorcode === row.vendorcode ? { ...item, [field]: value } : item
      );
      console.log('newData sample:', newData.find(i => i.vendorcode === row.vendorcode));
      return newData;
    });

    // Если изменилась группа — сразу отправляем на сервер и перезагружаем
    if (field === 'goods_grp_sel') {
      const token = userdata.userData?.userInfo?.token;
      changeGoodsGroup({
        vendorcode: row.vendorcode,
        goods_grp_id: value || null,
      }, token)
        .then(() => loadData())
        .catch(err => setError(err.message));
      return; // не помечаем строку как изменённую — она уже сохранена
    }

    // Для остальных полей — помечаем строку как изменённую
    markChanged(row);
  }, [markChanged, userdata]);

  // Группировка и сортировка
  const sortedData = useMemo(() => {
    if (tableData.length === 0) return [];
    return [...tableData].sort((a, b) => {
      const typeA = a.goods_type_name || '';
      const typeB = b.goods_type_name || '';
      if (typeA !== typeB) return typeA.localeCompare(typeB);

      const grpA = a.goods_grp_name || '';
      const grpB = b.goods_grp_name || '';
      if (grpA !== grpB) return grpA.localeCompare(grpB);

      return (a.title || '').localeCompare(b.title || '');
    });
  }, [tableData]);

  // Разделители
  const renderSeparator = useCallback((row, index, rows) => {
    const prev = rows[index - 1];
    const typeChanged = index === 0 || row.goods_type_name !== prev?.goods_type_name;
    const groupChanged = typeChanged || row.goods_grp_name !== prev?.goods_grp_name;

    return (
      <>
        {typeChanged && (
          <tr key={`type-${row.nmid}`}>
            <td colSpan={100} style={{ background: '#d0d0d0', fontWeight: 'bold', textAlign: 'center', padding: '8px' }}>
              {row.goods_type_name || 'Без типа'}
            </td>
          </tr>
        )}
        {groupChanged && (
          <tr key={`grp-${row.nmid}`}>
            <td colSpan={100} style={{ background: '#f0f0f0', textAlign: 'center', padding: '4px' }}>
              {row.goods_grp_name || 'Без группы'}
            </td>
          </tr>
        )}
      </>
    );
  }, []);

  // Собираем колонки
  const columns = useMemo(() => {
    if (!baseColumns || baseColumns.length === 0) return [];
    return [...baseColumns, actionsColumn];
  }, [baseColumns, actionsColumn]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      setSyncResult(null);
      setSyncError(null);
          // Sync goods from WB and OZON (one time at page load)
      if (syncResult === null) {
        try {
          const sync = await syncUserGoods(userdata.userData?.userInfo?.token);
          setSyncResult(sync);
        } catch (err) {
          setSyncError(err.response?.data?.error || err.message);
        }
      }

      // Загружаем группы для дроп-дауна
      const groupsData = await fetchGoodsGroups(
        userdata.userData?.locale || 'RU',
        userdata.userData?.userInfo?.token
      );
      setGroups(groupsData);

      // Загружаем товары
      const goods = await downloadGoodsData(userdata, setStatus);
      setTableData(goods);


      // Обогащаем товары полем goods_grp_sel
      const enriched = goods.map(item => ({
        ...item,
        goods_grp_sel: String(item.goods_grp_id || ''),
      }));

      if (enriched.length > 0) {
        const groupOptions = groupsData.map(g => ({
          value: String(g.id),
          label: g.goods_grp_name || String(g.id),
        }));

      await buildConfig(
        enriched,
        handleCellChange,
        {
          goods_grp_sel: {
            type: 'select',
            header: 'Группа',
            options: groupOptions,
            placeholder: 'Без группы',
          },
        },
        ['goods_grp_name']  
      );
      }
      originalDataRef.current = JSON.parse(JSON.stringify(enriched)); // глубокая копия
      setTableData(enriched);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading || configLoading) return <div>Loading...</div>;
  if (error || configError) return <div>Error: {error || configError}</div>;

  return (
    <div className={styles.vidget}>
      <h2>Информация о товарах</h2>
        <StatusMessage type="error">
          {syncError && `Ошибка синхронизации: ${syncError}`}
        </StatusMessage>

        <StatusMessage type="success">
          {syncResult && (
            <>
              Синхронизация завершена.
              <div>WB: добавлено {syncResult.wb.inserted}, обновлено {syncResult.wb.updated}, без изменений {syncResult.wb.unchanged} (всего {syncResult.wb.total})</div>
              <div>OZON: добавлено {syncResult.ozon.inserted}, обновлено {syncResult.ozon.updated}, без изменений {syncResult.ozon.unchanged} (всего {syncResult.ozon.total})</div>
            </>
          )}
        </StatusMessage>

      <DataTable
        data={sortedData}
        columns={columns}
        renderRowBefore={renderSeparator}
      />
    </div>
  );
};

export default GoodsMain;