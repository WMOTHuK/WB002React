// src/pages/goods/GoodsGroups.jsx
import React, { useState, useEffect, useMemo, useContext } from 'react';
import WideWidget from '../../components/ui/widewidget/WideWidget';
import DataTable from '../../components/table/DataTable';
import { UserContext } from '../../context/context';
import {
  fetchGoodsGroups,
  addGoodsGroup,
  changeGoodsGroupType,
  fetchGoodsTypes,
} from '../../services/api/goodsService';
import { getTableKeys } from '../../utils/tableHelpers';
import { getTableLocale } from '../../services/api/tableService';
import { buildTableConfig } from '../../utils/buildTableConfig';
import styles from '../../styles/styles.module.css';

const GoodsGroups = () => {
  const userdata = useContext(UserContext);
  const token = userdata.userData?.userInfo?.token;
  const locale = userdata.userData?.locale || 'RU';

  const [groups, setGroups] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Типы товаров (загружаем один раз)
  const [types, setTypes] = useState([]);

  // Форма добавления
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  // Загрузка типов (один раз)
  useEffect(() => {
    const init = async () => {
      const typs = await fetchGoodsTypes(locale, token);
      setTypes(typs);
      await loadData(typs);
    };
    init();
  }, []);

  // Группировка и сортировка данных
  const sortedGroups = useMemo(() => {
    if (groups.length === 0) return [];

    return [...groups].sort((a, b) => {
      const typeA = a.goods_type_id || 0;
      const typeB = b.goods_type_id || 0;
      if (typeA !== typeB) return typeA - typeB;
      return (a.goods_grp_name || '').localeCompare(b.goods_grp_name || '');
    });
  }, [groups]);

  const loadData = async (typesData) => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchGoodsGroups(locale, token);
      const typs = typesData || types;

      // Обогащаем данные: добавляем goods_type_sel для select
      const enrichedData = data.map(item => ({
        ...item,
        goods_type_sel: String(item.goods_type_id || ''),
      }));

      setGroups(enrichedData);

      if (enrichedData.length > 0) {
        const keys = getTableKeys(enrichedData);
        const allKeys = [...new Set([...keys, 'goods_type_sel'])];
        const translations = await getTableLocale(allKeys, locale, token);

        const typeOptions = typs.map(t => ({
          value: String(t.id),
          label: t.goods_type_name || t.id,
        }));

        const cols = buildTableConfig({
          keys: allKeys,
          translations,
          mode: 'edit',
          columnOverrides: {
            goods_type_sel: {
              type: 'select',
              header: 'Тип',
              options: typeOptions,
              placeholder: 'Без типа',
              onChange: async (value, row) => {
                try {
                  await changeGoodsGroupType({
                    id: row.id,
                    goods_type_id: value || null,
                  }, token);
                  await loadData();
                } catch (err) {
                  console.error('Ошибка смены типа:', err);
                }
              },
            },
          },
        });
        setColumns(cols);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Название обязательно');
      return;
    }
    setSaving(true);
    setFormError(null);

    try {
      await addGoodsGroup({
        name: name.trim(),
        description: description.trim(),
        goods_type_id: selectedType || null,
        locale,
      }, token);
      setName('');
      setDescription('');
      setSelectedType('');
      await loadData();
    } catch (err) {
      setFormError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  // Разделители между типами
  const renderTypeSeparator = (row, index, rows) => {
    if (index === 0 || row.goods_type_id !== rows[index - 1].goods_type_id) {
      const type = types.find(t => String(t.id) === String(row.goods_type_id));
      const typeName = type?.goods_type_name || 'Пока не типизировано';
      const colspan = columns.length || 3;

      return (
        <tr key={`sep-${row.id}`} className={styles.groupSeparator}>
          <td colSpan={colspan} style={{ textAlign: 'center', fontWeight: 'bold', background: '#f0f0f0', padding: '6px' }}>
            {typeName}
          </td>
        </tr>
      );
    }
    return null;
  };

  if (loading) return (
    <WideWidget title="Группы товаров">
      <div className={styles.contentCentered}><div>Загрузка...</div></div>
    </WideWidget>
  );

  return (
    <WideWidget title="Группы товаров">
      <div className={styles.contentCentered}>
        {error && <div className={styles.error}>Ошибка: {error}</div>}

        {sortedGroups.length > 0 && (
          <>
            <h3>Существующие группы</h3>
            <DataTable
              data={sortedGroups}
              columns={columns}
              renderRowBefore={renderTypeSeparator}
            />
          </>
        )}
        {sortedGroups.length === 0 && !error && <p>Нет существующих групп товаров</p>}

        <h3 style={{ marginTop: 30 }}>Добавить новую группу</h3>
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
          <div className={styles.formGroup}>
            <label>Тип товаров:</label>
            <select
              className={styles.overheadInput}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">Без типа</option>
              {types.map(t => (
                <option key={t.id} value={t.id}>
                  {t.goods_type_name}
                </option>
              ))}
            </select>
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

export default GoodsGroups;