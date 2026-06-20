import React, { useState, useEffect, useContext } from 'react';
import WideWidget from '../../components/ui/widewidget/WideWidget';
import DataTable from '../../components/table/DataTable';
import StatusMessage from '../../components/ui/StatusMessage';
import { UserContext } from '../../context/context';
import { updateWBReportsList, fetchWBReportsList, fetchWBReportDetails } from '../../services/api/financeService';
import { getTableKeys } from '../../utils/tableHelpers';
import { getTableLocale } from '../../services/api/tableService';
import { buildTableConfig } from '../../utils/buildTableConfig';
import { withActionIcon } from '../../utils/columnHelpers';
import SyncByDateForm from '../../components/ui/SyncByDateForm';
import styles from '../../styles/styles.module.css';

const FI_WBReportsList = () => {
  const userdata = useContext(UserContext);
  const token = userdata.userData?.userInfo?.token;
  const locale = userdata.userData?.locale || 'RU';

  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 31);
    return d.toISOString().slice(0, 10);
    });
  const [dateTo, setDateTo] = useState(() => {
    return new Date().toISOString().slice(0, 10);
    });
  const [syncResult, setSyncResult] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false); // Main table update status
  const [loadingReportId, setLoadingReportId] = useState(null); 
  const [successReportId, setSuccessReportId] = useState(null);
  const [errorReportId, setErrorReportId] = useState(null);

  const [detailResult, setDetailResult] = useState(null);
  const [detailError, setDetailError] = useState(null);


  const handleDownloadReport = async (row) => {
    setDetailResult(null);
    setDetailError(null);

    try {
      const result = await fetchWBReportDetails(row.report_id, token);
      setDetailResult(result);
      setSuccessReportId(row.report_id);
      setTimeout(() => {
        setSuccessReportId(null);
        loadData();
      }, 2000);
    } catch (err) {
      setErrorReportId(row.report_id);
      setDetailError(err.response?.data?.error || err.message);
      setTimeout(() => setErrorReportId(null), 3000);
    }
  };

  
  const loadData = async () => {
    setLoading(true);
    try {
      const reports = await fetchWBReportsList(token);
      setData(reports);

      if (reports.length > 0) {
        const keys = getTableKeys(reports);
        const translations = await getTableLocale(keys, locale, token);
        const cols = buildTableConfig({ keys, translations, mode: 'view' });
        const getLoadingId = () => loadingReportId;
        const mapper = withActionIcon('has_items', handleDownloadReport);
        const colsWithActions = cols.map(col =>
          mapper(col, () => loadingReportId, setLoadingReportId, () => successReportId, setSuccessReportId)
        );
        setColumns(colsWithActions)
      }
    } catch (err) {
      console.error('Ошибка загрузки отчётов:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (data.length === 0) return;

    const buildCols = async () => {
      const keys = getTableKeys(data);
      const translations = await getTableLocale(keys, locale, token);
      const cols = buildTableConfig({ keys, translations, mode: 'view' });
      const mapper = withActionIcon('has_items', handleDownloadReport);
      const colsWithActions = cols.map(col =>
        mapper(
          col,
          () => loadingReportId, setLoadingReportId,
          () => successReportId, setSuccessReportId,
          () => errorReportId, setErrorReportId
        )
      );
      setColumns(colsWithActions);
    };

    buildCols();
  }, [data, loadingReportId, successReportId, errorReportId]);


  const handleUpdate = async () => {
    if (!dateFrom || !dateTo) {
      setSyncError('Выберите обе даты');
      return;
    }

    setSyncing(true);
    setSyncResult(null);
    setSyncError(null);

    try {
      const result = await updateWBReportsList(dateFrom, dateTo, token);
      setSyncResult(result);
      await loadData(); // перезагружаем таблицу после обновления
    } catch (err) {
      setSyncError(err.response?.data?.error || err.message);
    } finally {
      setSyncing(false);
    }
  };




  return (
    <WideWidget title="WB Список отчётов">
      <div className={styles.contentCentered}>

        <SyncByDateForm
            label="Получить с серверов WB список отчётов за период с"
            apiFn={updateWBReportsList}
            token={token}
            onSuccess={() => loadData()}
        />

        <StatusMessage type="success">
          {detailResult && (
            <>
              Детали отчёта обновлены. Получено: {detailResult.processed ?? '—'}, вставлено: {detailResult.inserted ?? '—'}, пропущено: {detailResult.skipped ?? '—'}, ошибки: {detailResult.errors ?? '—'}
            </>
          )}
        </StatusMessage>
        <StatusMessage type="error">{detailError}</StatusMessage>


        {loading ? (
          <div>Загрузка таблицы...</div>
        ) : data.length > 0 ? (
          <DataTable data={data} columns={columns} />
        ) : (
          <p>Нет отчётов за выбранный период</p>
        )}
      </div>
    </WideWidget>
  );
};

export default FI_WBReportsList;