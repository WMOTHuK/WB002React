// src/features/goods/GoodsMain.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/styles.module.css';
import DataTable from '../../components/table/DataTable';
import { UserContext } from '../../context/context';
import { downloadGoodsData } from '../../services/api/goodsservice';
import { useTableConfig } from '../../hooks/useTableConfig';

const GoodsMain = () => {
  const [status, setStatus] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userdata = useContext(UserContext);
  const navigate = useNavigate();

  const {
    columns,
    loading: configLoading,
    error: configError,
    buildConfig,
  } = useTableConfig(navigate, userdata.userData.userInfo?.locale, 'edit', userdata.userData.userInfo?.token);

  const loadData = async () => {
    try {
      // 1. Fetch data
      const goods = await downloadGoodsData(userdata, setStatus);
      setTableData(goods);


      // 2. Build table config (keys + translations + columns)
      await buildConfig(goods, (field, value, row) => {
        setTableData(prev =>
          prev.map(item =>
            item.nmid === row.nmid ? { ...item, [field]: value } : item
          )
        );
      });
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
      <h2>Product data</h2>
      <DataTable
        data={tableData}
        columns={columns}
        onRowClick={(row) => navigate(`/goods/${row.nmid}`)}
      />
    </div>
  );
};

export default GoodsMain;
