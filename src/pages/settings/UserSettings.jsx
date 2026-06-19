import React, { useState, useEffect, useContext, useMemo, useCallback, useRef } from 'react';
import WideWidget from '../../components/ui/widewidget/WideWidget';
import DataTable from '../../components/table/DataTable';
import { UserContext } from '../../context/context';
import { fetchUserSettings, saveUserSettingsRow } from '../../services/api/userService';
import { getTableKeys } from '../../utils/tableHelpers';
import { getTableLocale } from '../../services/api/tableService';
import { buildTableConfig } from '../../utils/buildTableConfig';
import { useRowSave } from '../../hooks/useRowSave';
import styles from '../../styles/styles.module.css';
import StatusMessage from '../../components/ui/StatusMessage';

const UserSettings = () => {
    const userdata = useContext(UserContext);
    const token = userdata.userData?.userInfo?.token;
    const locale = userdata.userData?.locale || 'RU';

    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [saveResult, setSaveResult] = useState(null);
    const [saveError, setSaveError] = useState(null);

    const originalDataRef = useRef([]);

    // Кастомная функция сохранения
    const handleSaveRow = useCallback(async (row) => {
    const originalRow = originalDataRef.current.find(r => r.id === row.id);
    const result = await saveUserSettingsRow(row, originalRow, token);
    
    if (result.success) {
        setSaveResult('Настройки сохранены');
        setSaveError(null);
        // Обновляем originalDataRef — теперь текущие данные становятся эталоном
        originalDataRef.current = JSON.parse(JSON.stringify(
        data.map(item => (item.id || item.user_id) === (row.id || row.user_id) ? row : item)
        ));
        setTimeout(() => setSaveResult(null), 3000);
    } else {
        setSaveError(result.error);
        setSaveResult(null);
    }
    
    return result;
    }, [token, data]);

    const { markChanged, actionsColumn } = useRowSave({
    saveFn: handleSaveRow,
    getRowId: (row) => String(row.id || row.user_id),
    });

    const handleCellChange = useCallback((field, value, row) => {
    setData(prev =>
        prev.map(item =>
        (item.id || item.user_id) === (row.id || row.user_id)
            ? { ...item, [field]: value }
            : item
        )
    );
    markChanged(row);
    }, [markChanged]);

    const loadData = async () => {
    try {
        setLoading(true);
        setError(null);

        const settings = await fetchUserSettings(token);
        setData(settings);
        originalDataRef.current = JSON.parse(JSON.stringify(settings));

        if (settings.length > 0) {
        const keys = getTableKeys(settings);
        const translations = await getTableLocale(keys, locale, token);
        const cols = buildTableConfig({ keys, translations, mode: 'edit', onChange: handleCellChange });
        setColumns(cols);
        }
    } catch (err) {
        setError(err.response?.data?.error || err.message);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Добавляем колонку с кнопкой сохранения
  const allColumns = useMemo(() => {
    if (columns.length === 0) return [];
    return [...columns, actionsColumn];
  }, [columns, actionsColumn]);

  if (loading) return (
    <WideWidget title="Настройки">
      <div className={styles.contentCentered}>Загрузка...</div>
    </WideWidget>
  );

  return (
    <WideWidget title="Настройки">
      <div className={styles.contentCentered}>
        <StatusMessage type="error">{error || saveError}</StatusMessage>
        <StatusMessage type="success">{saveResult}</StatusMessage>

        {data.length > 0 ? (
        <DataTable data={data} columns={allColumns} />
        ) : (
        !error && <p>Нет настроек</p>
        )}
      </div>
    </WideWidget>
  );
};

export default UserSettings;