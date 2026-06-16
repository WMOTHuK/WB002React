import React, { useState } from 'react';
import StatusMessage from './StatusMessage';
import styles from '../../styles/styles.module.css';

const SyncByDateForm = ({ label, apiFn, token, onSuccess }) => {
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 31);
    return d.toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    if (!dateFrom || !dateTo) {
      setError('Выберите обе даты');
      return;
    }
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = await apiFn(dateFrom, dateTo, token);
      setResult(data);
      if (onSuccess) onSuccess(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.reportsForm}>
        <label>{label}</label>
        <input type="date" className={styles.overheadInput} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <label>по</label>
        <input type="date" className={styles.overheadInput} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        <button className={styles.centeredButton} onClick={handleSync} disabled={loading}>
          {loading ? 'Загрузка...' : 'Получить'}
        </button>
      </div>

      <StatusMessage type="error">{error}</StatusMessage>
      <StatusMessage type="success">
        {result && (
          <>
            {label}. Получено: {result.processed ?? '—'}, Вставлено: {result.inserted ?? '—'}, Обновлено: {result.updated ?? '—'}, Ошибки: {result.errors ?? '—'}
          </>
        )}
      </StatusMessage>
    </>
  );
};

export default SyncByDateForm;