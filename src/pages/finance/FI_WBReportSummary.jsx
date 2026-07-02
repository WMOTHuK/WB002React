import React, { useState, useEffect, useContext } from 'react';
import WideWidget from '../../components/ui/widewidget/WideWidget';
import DataTable from '../../components/table/DataTable';
import StatusMessage from '../../components/ui/StatusMessage';
import { UserContext } from '../../context/context';
import { fetchWBReportSummary, calculateWBReport, fetchWBReportProductSummary, checkWBReport } from '../../services/api/financeService';
import { getTableKeys } from '../../utils/tableHelpers';
import { getTableLocale } from '../../services/api/tableService';
import { buildTableConfig } from '../../utils/buildTableConfig';
import styles from '../../styles/styles.module.css';
import tableStyles from '../../styles/DataTable.module.css';
import Modal from '../../components/ui/Modal';


const FI_WBReportSummary = () => {
  const userdata = useContext(UserContext);
  const token = userdata.userData?.userInfo?.token;
  const locale = userdata.userData?.locale || 'RU';

  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Состояния для расчёта
  const [calcResult, setCalcResult] = useState(null);
  const [calcError, setCalcError] = useState(null);
  const [calculating, setCalculating] = useState(null); // какой reportId сейчас считается


  // Состояния для модалки со сверкой
  const [checkModalOpen, setCheckModalOpen] = useState(false);
  const [checkModalTitle, setCheckModalTitle] = useState('');
  const [checkData, setCheckData] = useState([]);
  const [checkColumns, setCheckColumns] = useState([]);
  const [checkLoading, setCheckLoading] = useState(false);

  const handleCalculate = async (reportId) => {
    setCalculating(reportId);
    setCalcResult(null);
    setCalcError(null);

    try {
      const result = await calculateWBReport(reportId, token);
      if (result.success) {
        setCalcResult(result);
        await loadData(); // ← обновить таблицу
      } else {
        setCalcError(result.error || 'Неизвестная ошибка');
      }
    } catch (err) {
      setCalcError(err.response?.data?.error || err.message);
    } finally {
      setCalculating(null);
    }
  };

  const handleCheckReport = async (reportId) => {
    setCheckModalTitle(`Сверка отчёта: ${reportId}`);
    setCheckModalOpen(true);
    setCheckLoading(true);

    try {
      const data = await checkWBReport(reportId, token);
      setCheckData(data);

      if (data.length > 0) {
        const keys = getTableKeys(data);
        const translations = await getTableLocale(keys, locale, token);
        const cols = buildTableConfig({ keys, translations, mode: 'view' });
        setCheckColumns(cols);
      }
    } catch (err) {
      console.error('Ошибка сверки отчёта:', err);
    } finally {
      setCheckLoading(false);
    }
  };
  
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

        <StatusMessage type="error">{calcError}</StatusMessage>

        {calcResult && !calcResult.success && (
        <StatusMessage type="error">{calcResult.error || 'Ошибка расчёта'}</StatusMessage>
        )}

        {calcResult && calcResult.success && calcResult.unmatchedCount > 0 && (
        <StatusMessage type="error">
            Расчёт выполнен, но есть несопоставленные строки ({calcResult.unmatchedCount}):
            <div style={{ marginTop: 4 }}>
            {calcResult.unmatchedSample.map((item, i) => (
                <div key={i}>• {typeof item === 'string' ? item : (item.article || item.name || JSON.stringify(item))}</div>
            ))}
            </div>
        </StatusMessage>
        )}

        {calcResult && calcResult.success && calcResult.unmatchedCount === 0 && (
        <StatusMessage type="success">
            Расчёт выполнен успешно. Обработано: {calcResult.processedCount}, обновлено сводки: {calcResult.summaryUpdated ? 'Да' : 'Нет'}
        </StatusMessage>
        )}

        {data.length > 0 ? (
          <div className={tableStyles.wrapper}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  {columns.map(col => (
                    <th key={col.accessorKey} className={tableStyles.th}>
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Строка с кнопками "Выполнить расчёт" */}
                <tr>
                  <td className={tableStyles.td}></td>
                  {columns.slice(1).map(col => (
                    <td key={col.accessorKey} className={tableStyles.td} style={{ textAlign: 'center' }}>
                      <button
                        className={styles.centeredButton}
                        style={{ padding: '2px 8px', fontSize: 12 }}
                        disabled={calculating === col.header}
                        onClick={() => handleCalculate(col.header)}
                      >
                        {calculating === col.header ? 'Считаю...' : 'Выполнить расчёт'}
                      </button>
                    </td>
                  ))}
                </tr>

                {/* Строка с кнопками "Сверить расчёт" */}
                <tr>
                  <td className={tableStyles.td}></td>
                  {columns.slice(1).map(col => (
                    <td key={col.accessorKey} className={tableStyles.td} style={{ textAlign: 'center' }}>
                      <button
                        className={styles.centeredButton}
                        style={{ padding: '2px 8px', fontSize: 12 }}
                        onClick={() => handleCheckReport(col.header)}
                      >
                        Сверка отчёта
                      </button>
                    </td>
                  ))}
                </tr>
                {/* Строки данных */}
                {data.map((row, i) => (
                  <tr key={i} className={tableStyles.row}>
                    {columns.map(col => (
                      <td key={col.accessorKey} className={tableStyles.td}>
                        {row[col.accessorKey]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !error && <p>Нет данных</p>
        )}
      </div>
      {checkModalOpen && (
        <Modal title={checkModalTitle} onClose={() => setCheckModalOpen(false)}>
          {checkLoading ? (
            <div>Загрузка...</div>
          ) : checkData.length > 0 ? (
            <DataTable data={checkData} columns={checkColumns} />
          ) : (
            <p>Нет данных сверки</p>
          )}
        </Modal>
      )}
    </WideWidget>
  );
};

export default FI_WBReportSummary;