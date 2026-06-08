// src/features/goods/GoodsMain.jsx

import React, { useState, useEffect, useContext, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../../styles/styles.module.css';
import DataTable from '../../components/table/DataTable';
import { UserContext } from '../../context/context';
import { downloadGoodsData } from '../../services/api/goodsservice';
import { useTableConfig } from '../../hooks/useTableConfig';
import { useRowSave } from '../../hooks/useRowSave';

const GoodsMain = () => {
  const [status, setStatus] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userdata = useContext(UserContext);
  const navigate = useNavigate();

  const {
    columns: baseColumns,
    loading: configLoading,
    error: configError,
    buildConfig,
  } = useTableConfig(navigate, userdata.userData?.locale, 'edit', userdata.userData?.userInfo?.token);

  // Custom save function for goods
  const saveGoodsRow = useCallback(async (row) => {
    const token = userdata.userData?.userInfo?.token;
    await axios.post('/api/content/update_cost_price', {
      vendorcode: row.vendorcode,
      new_cost: row.current_cost,
      start_date: row.change_date,
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }, [userdata]);

  const { markChanged, actionsColumn } = useRowSave({
    saveFn: saveGoodsRow,
    getRowId: (row) => String(row.nmid),
  });

  // Сохраняем tableData в ref, чтобы onChange не зависел от состояния
  const tableDataRef = useRef(tableData);
  tableDataRef.current = tableData;

  const handleCellChange = useCallback((field, value, row) => {
    setTableData(prev => {
      const newData = prev.map(item =>
        item.nmid === row.nmid ? { ...item, [field]: value } : item
      );
      return newData;
    });
    markChanged(row);
  }, [markChanged]);

  const columns = useMemo(() => {
    if (!baseColumns || baseColumns.length === 0) return [];
    return [...baseColumns, actionsColumn];
  }, [baseColumns, actionsColumn]);

  const loadData = async () => {
    try {
      const goods = await downloadGoodsData(userdata, setStatus);
      setTableData(goods);
      await buildConfig(goods, handleCellChange);
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
      <div>{status.map((line, i) => <p key={i}>{line}</p>)}</div>
      <h2>Информация о товарах</h2>
      <DataTable data={tableData} columns={columns} />
    </div>
  );
};

export default GoodsMain;