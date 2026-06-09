// src/pages/goods/GoodsTypes.jsx
import React, { useState, useEffect, useContext } from 'react';
import WideWidget from '../../components/ui/widewidget/WideWidget';
import DataTable from '../../components/table/DataTable';
import { UserContext } from '../../context/context';
import { fetchGoodsTypes, addGoodsType } from '../../services/api/goodsService';
import { getTableKeys } from '../../utils/tableHelpers';
import { getTableLocale } from '../../services/api/tableService';
import { buildTableConfig } from '../../utils/buildTableConfig';
import styles from '../../styles/styles.module.css';

const GoodsTypes = () => {
  const userdata = useContext(UserContext);
  const token = userdata.userData?.userInfo?.token;
  const locale = userdata.userData?.locale || 'RU';

  const [types, setTypes] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchGoodsTypes(locale, token);
      setTypes(data);

      if (data.length > 0) {
        const keys = getTableKeys(data);
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

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Название обязательно');
      return;
    }
    setSaving(true);
    setFormError(null);

    try {
      await addGoodsType({ name: name.trim(), description: description.trim(), locale }, token);
      setName('');
      setDescription('');
      await loadData();
    } catch (err) {
      setFormError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <WideWidget title="Типы товаров">
      <div className={styles.contentCentered}><div>Загрузка...</div></div>
    </WideWidget>
  );

  return (
    <WideWidget title="Типы товаров">
      <div className={styles.contentCentered}>
        {error && <div className={styles.error}>Ошибка: {error}</div>}

        {types.length > 0 && (
          <>
            <h3>Существующие типы</h3>
            <DataTable data={types} columns={columns} />
          </>
        )}
        {types.length === 0 && !error && <p>Нет существующих типов товаров</p>}

        <h3 style={{ marginTop: 30 }}>Добавить новый тип</h3>
        <form onSubmit={handleAdd}>
          <div className={styles.formGroup}>
            <label>Название:</label>
            <input
              type="text"
              className={styles.overheadInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Описание:</label>
            <textarea
              className={styles.overheadTextarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>
          {formError && <div className={styles.error}>{formError}</div>}
          <button type="submit" className={styles.centeredButton} disabled={saving}>
            {saving ? 'Сохранение...' : 'Добавить'}
          </button>
        </form>
      </div>
    </WideWidget>
  );
};

export default GoodsTypes;
