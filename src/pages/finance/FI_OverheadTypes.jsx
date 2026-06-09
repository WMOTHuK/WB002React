// src/pages/finance/FI_OverheadTypes.jsx
import React, { useState, useEffect, useMemo, useContext } from 'react';
import WideWidget from '../../components/ui/widewidget/WideWidget';
import DataTable from '../../components/table/DataTable';
import { UserContext } from '../../context/context';
import {
  fetchOverheadTypes,
  addOverheadType,
  changeOverheadTypeGroup,
  fetchOverheadGroups,
} from '../../services/api/financeService';
import { getTableKeys } from '../../utils/tableHelpers';
import { getTableLocale } from '../../services/api/tableService';
import { buildTableConfig } from '../../utils/buildTableConfig';
import styles from '../../styles/styles.module.css';

const FI_OverheadTypes = () => {
  const userdata = useContext(UserContext);
  const token = userdata.userData?.userInfo?.token;
  const locale = userdata.userData?.locale || 'RU';

  const [types, setTypes] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Группы (загружаем один раз)
  const [groups, setGroups] = useState([]);

  // Форма добавления
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  // Загрузка групп (один раз)
  useEffect(() => {
    const init = async () => {
      const grp = await fetchOverheadGroups(locale, token);
      setGroups(grp);
      // loadData внутри использует groups из состояния, но оно ещё не обновилось!
      // Поэтому передадим groups явно
      await loadData(grp);
    };
    init();
  }, []);

  // Группировка и сортировка данных
  const sortedTypes = useMemo(() => {
    if (types.length === 0) return [];

    return [...types].sort((a, b) => {
      const grpA = a.oh_grp_id || 0;
      const grpB = b.oh_grp_id || 0;
      if (grpA !== grpB) return grpA - grpB;
      return (a.oh_name || '').localeCompare(b.oh_name || '');
    });
  }, [types]);

  const loadData = async (groupsData) => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchOverheadTypes(locale, token);
      const grp = groupsData || groups;

      // Обогащаем данные: добавляем oh_grp_sel для select и oh_grp_name для разделителей
      const enrichedData = data.map(item => {
        const group = grp.find(g => String(g.id) === String(item.oh_grp_id));
        return {
          ...item,
          oh_grp_sel: String(item.oh_grp_id || ''),
        };
      });

      setTypes(enrichedData);

      if (enrichedData.length > 0) {
        const keys = getTableKeys(enrichedData);
        const allKeys = [...new Set([...keys, 'oh_grp_sel'])];
        const translations = await getTableLocale(allKeys, locale, token);

        const groupOptions = grp.map(g => ({
          value: String(g.id),
          label: g.oh_grp_name || g.id,
        }));

        const cols = buildTableConfig({
          keys: allKeys,
          translations,
          mode: 'edit',
          columnOverrides: {
            oh_grp_sel: {
              type: 'select',
              header: 'Группа',
              options: groupOptions,
              placeholder: 'Без группы',
              onChange: async (value, row) => {
                try {
                  await changeOverheadTypeGroup({
                    id: row.id,
                    oh_grp_id: value || null,
                  }, token);
                  await loadData();
                } catch (err) {
                  console.error('Ошибка смены группы:', err);
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

  useEffect(() => {
    if (groups.length >= 0) loadData();
  }, [groups]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Название обязательно');
      return;
    }
    setSaving(true);
    setFormError(null);

    try {
      await addOverheadType({
        name: name.trim(),
        description: description.trim(),
        oh_grp_id: selectedGroup || null,
        locale,
      }, token);
      setName('');
      setDescription('');
      setSelectedGroup('');
      await loadData();
    } catch (err) {
      setFormError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  // Функция для рендера разделителей между группами
  const renderGroupSeparator = (row, index, rows) => {
    if (index === 0 || row.oh_grp_id !== rows[index - 1].oh_grp_id) {
      const group = groups.find(g => String(g.id) === String(row.oh_grp_id));
      const groupName = group?.oh_grp_name || 'Пока не сгруппировано';
      const colspan = columns.length || 3;

      return (
        <tr key={`sep-${row.id}`} className={styles.groupSeparator}>
          <td colSpan={colspan} style={{ textAlign: 'center', fontWeight: 'bold', background: '#f0f0f0', padding: '6px' }}>
            {groupName}
          </td>
        </tr>
      );
    }
    return null;
  };

  if (loading) return <WideWidget title="Категории накладных расходов"><div>Загрузка...</div></WideWidget>;

  return (
    <WideWidget title="Категории накладных расходов">
    <div className={styles.contentCentered}>
      {error && <div className={styles.error}>Ошибка: {error}</div>}

      {sortedTypes.length > 0 && (
        <>
          <h3>Существующие категории</h3>
          <DataTable
            data={sortedTypes}
            columns={columns}
            renderRowBefore={renderGroupSeparator}
          />
        </>
      )}
      {sortedTypes.length === 0 && !error && (
        <p>Нет существующих категорий накладных расходов</p>
      )}

      <h3 style={{ marginTop: 30 }}>Добавить новую Категорию</h3>
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
          <label>Группа накладных:</label>
          <select
            className={styles.overheadInput}
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <option value="">Без группы</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>
                {g.oh_grp_name}
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

export default FI_OverheadTypes;