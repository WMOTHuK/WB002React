import React, { useState, useEffect, useContext } from 'react';
import WideWidget from '../../components/ui/widewidget/WideWidget';
import StatusMessage from '../../components/ui/StatusMessage';
import { UserContext } from '../../context/context';
import { syncData } from '../../services/api/userService';
import styles from '../../styles/styles.module.css';

const Home = () => {
  const userdata = useContext(UserContext);
  const token = userdata.userData?.userInfo?.token;

  const [syncResult, setSyncResult] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!token) return;

    const runSync = async () => {
      setSyncing(true);
      try {
        const result = await syncData(token);
        setSyncResult(result);
      } catch (err) {
        setSyncError(err.response?.data?.error || err.message);
      } finally {
        setSyncing(false);
      }
    };

    runSync();
  }, [token]);

  return (
    <WideWidget title="Главная">
      <div className={styles.contentCentered}>
        {syncing && <div>Синхронизация данных...</div>}

        <StatusMessage type="error">{syncError}</StatusMessage>

        {syncResult?.success && (
          <StatusMessage type="success">
            <div>Синхронизация завершена:</div>
            <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
              <li>Товары: WB +{syncResult.results.goods.wb.inserted}, OZON +{syncResult.results.goods.ozon.inserted}</li>
              <li>Кампании: +{syncResult.results.campaigns.inserted}</li>
              <li>Затраты кампаний: обработано {syncResult.results.campaignCosts.processed}</li>
              <li>Отчёты: получено {syncResult.results.finReports.reportsCount}, без деталей {syncResult.results.finReports.missingDetails}, обработано {syncResult.results.finReports.processed}</li>
            </ul>
          </StatusMessage>
        )}

        {!syncing && !syncResult && !syncError && (
          <p>Добро пожаловать!</p>
        )}
      </div>
    </WideWidget>
  );
};

export default Home;