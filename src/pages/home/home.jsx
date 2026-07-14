import React, { useState, useEffect, useContext } from 'react';
import WideWidget from '../../components/ui/widewidget/WideWidget';
import { UserContext } from '../../context/context';
import { syncData } from '../../services/api/userService';
import styles from '../../styles/styles.module.css';

const renderTaskResult = (data) => {
  if (!data) return '—';
  const parts = [];
  if (data.inserted !== undefined) parts.push(`добавлено ${data.inserted}`);
  if (data.updated !== undefined) parts.push(`обновлено ${data.updated}`);
  if (data.unchanged !== undefined) parts.push(`без изменений ${data.unchanged}`);
  if (data.processed !== undefined) parts.push(`обработано ${data.processed}`);
  if (data.reportsCount !== undefined) {
    parts.push(`получено ${data.reportsCount}`);
    if (data.missingDetails) parts.push(`без деталей ${data.missingDetails}`);
  }
  if (data.total !== undefined && data.inserted === undefined && data.reportsCount === undefined) {
    parts.push(`всего ${data.total}`);
  }
  return parts.length > 0 ? parts.join(', ') : 'выполнено';
};

const renderSucceededItem = (item) => {
  return (
    <div key={item.task}>
      {item.task}: {renderTaskResult(item.result)}
    </div>
  );
};

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

  const blockStyle = (type) => ({
    width: '100%',
    boxSizing: 'border-box',
    background: type === 'success' ? '#e8f5e9' : '#ffebee',
    color: type === 'success' ? '#2e7d32' : '#c62828',
    padding: '12px 16px',
    borderRadius: 4,
    border: `1px solid ${type === 'success' ? '#a5d6a7' : '#ef9a9a'}`,
    marginBottom: 12,
    lineHeight: 1.6,
  });
  const headerStyle = (type) => ({
    fontWeight: 'bold',
    marginBottom: 6,
    color: type === 'success' ? '#2e7d32' : '#c62828',
  });

  return (
    <WideWidget title="Главная">
      <div className={styles.contentCentered}>
        {syncing && <div>Синхронизация данных...</div>}

        {syncError && (
          <div style={blockStyle('error')}>{syncError}</div>
        )}
        {syncResult && (
          <div style={{ display: 'table', margin: '0 auto' }}>
            {syncResult.succeeded?.length > 0 && (
              <div style={blockStyle('success')}>
                <div style={headerStyle('success')}>Выполнено:</div>
                {syncResult.succeeded.map(item => renderSucceededItem(item))}
              </div>
            )}

            {syncResult.failed?.length > 0 && (
              <div style={blockStyle('error')}>
                <div style={headerStyle('error')}>Ошибки:</div>
                {syncResult.failed.map((item, i) => (
                  <div key={i}>• {item.task}: {item.error}</div>
                ))}
              </div>
            )}
          </div>
        )}
        {!syncing && !syncResult && !syncError && (
          <p>Добро пожаловать!</p>
        )}
      </div>
    </WideWidget>
  );
};

export default Home;