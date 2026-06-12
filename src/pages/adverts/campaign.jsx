// src/pages/adverts/campaign.jsx
import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import WideWidget from '../../components/ui/widewidget/WideWidget';
import DataTable from '../../components/table/DataTable';
import { UserContext } from '../../context/context';
import { fetchActiveCompaigns, updateCRMFromWB } from '../../services/api/advertservice.js';
import { getTableKeys } from '../../utils/tableHelpers';
import { getTableLocale } from '../../services/api/tableService';
import { buildTableConfig } from '../../utils/buildTableConfig';
import styles from '../../styles/styles.module.css';
import tableStyles from '../../styles/DataTable.module.css';

const CRM_Campaigns = () => {
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

        // 1. Обновляем данные с Wildberries
        await updateCRMFromWB(token);

        // 2. Загружаем актуальные кампании
        const campaigns = await fetchActiveCompaigns(token);
        setData(campaigns);

        if (campaigns.length > 0) {
          const allKeys = [...getTableKeys(campaigns), '_groups', '_cards'];
          const translations = await getTableLocale(allKeys, locale, token);
          const cols = buildTableConfig({ keys: allKeys, translations, mode: 'view' });
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
    <WideWidget title="Рекламные кампании">
      <div className={styles.contentCentered}>Загрузка...</div>
    </WideWidget>
  );

  return (
    <WideWidget title="Рекламные кампании">
      <div className={styles.contentCentered}>
        {error && <div className={styles.error}>Ошибка: {error}</div>}

        {data.length > 0 ? (
          <DataTable data={data} columns={columns} />
        ) : (
          !error && <p>Нет активных рекламных кампаний</p>
        )}
      </div>
    </WideWidget>
  );
};

export default CRM_Campaigns;