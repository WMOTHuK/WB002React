import React, { useState, useEffect, useContext } from 'react';
import WideWidget from '../../components/ui/widewidget/WideWidget';
import DataTable from '../../components/table/DataTable';
import { UserContext } from '../../context/context';
import { fetchWBReportSummary } from '../../services/api/financeService';
import { getTableKeys } from '../../utils/tableHelpers';
import { getTableLocale } from '../../services/api/tableService';
import { buildTableConfig } from '../../utils/buildTableConfig';
import styles from '../../styles/styles.module.css';

const FI_WBReportSummary = () => {
  const userdata = useContext(UserContext);
  const token = userdata.userData?.userInfo?.token;
  const locale = userdata.userData?.locale || 'RU';

  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const reports = await fetchWBReportSummary(4, token);
      setData(reports);

      if (reports.length > 0) {
        const keys = getTableKeys(reports);
        const translations = await getTableLocale(keys, locale, token);
        const cols = buildTableConfig({ keys, translations, mode: 'view' });
        setColumns(cols);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return (
    <WideWidget title="WB недельные отчёты">
      <div className={styles.contentCentered}>Загрузка...</div>
    </WideWidget>
  );

  return (
    <WideWidget title="WB недельные отчёты">
      <div className={styles.contentCentered}>
        {error && <div className={styles.error}>Ошибка: {error}</div>}

        {data.length > 0 ? (
          <DataTable data={data} columns={columns} />
        ) : (
          !error && <p>Нет данных</p>
        )}
      </div>
    </WideWidget>
  );
};

export default FI_WBReportSummary;
