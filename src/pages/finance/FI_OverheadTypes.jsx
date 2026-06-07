// src/pages/finance/FI_OverheadTypes.jsx
import React, { useState, useMemo } from 'react';
import WideWidget from '../../components/ui/widewidget/WideWidget';
import DataTable from '../../components/table/DataTable';
import { useOverheadTypes } from '../../hooks/useOverheadTypes';
import { useRowSave } from '../../hooks/useRowSave';
import styles from '../../styles/styles.module.css';

const FI_OverheadTypes = () => {
  const { types, loading, error, addType } = useOverheadTypes();

  // ---- Таблица просмотра ----
  const viewColumns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Название',
      type: 'text',
    },
    {
      accessorKey: 'description',
      header: 'Описание',
      type: 'text',
    },
  ], []);

  // ---- Форма добавления (одна пустая строка) ----
  const [newRow, setNewRow] = useState({ name: '', description: '' });

  const handleNewCellChange = (field, value) => {
    setNewRow(prev => ({ ...prev, [field]: value }));
  };

  // Переиспользуем хук сохранения с кастомной saveFn
  const { markChanged, actionsColumn } = useRowSave({
    saveFn: async (row) => {
      const result = await addType(row);
      if (result.success) {
        setNewRow({ name: '', description: '' }); // очищаем форму
      } else {
        throw new Error(result.error); // чтобы хук показал ошибку
      }
    },
    getRowId: () => 'new', // одна строка
  });

  const editColumns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Название',
      type: 'text',
      editable: true,
      onChange: (value) => handleNewCellChange('name', value),
    },
    {
      accessorKey: 'description',
      header: 'Описание',
      type: 'text',
      editable: true,
      onChange: (value) => handleNewCellChange('description', value),
    },
    actionsColumn,
  ], [actionsColumn]);

  if (loading) return <WideWidget title="Типы накладных расходов"><div>Загрузка...</div></WideWidget>;
  if (error) return <WideWidget title="Типы накладных расходов"><div className={styles.error}>Ошибка: {error}</div></WideWidget>;

return (
<WideWidget title="Типы накладных расходов">
    {error && <div className={styles.error}>Ошибка: {error}</div>}

    {types.length > 0 && (
    <>
        <h3>Существующие типы</h3>
        <DataTable data={types} columns={viewColumns} />
    </>
    )}

    {types.length === 0 && !error && (
    <p>Нет существующих типов накладных расходов</p>
    )}

    <h3 style={{ marginTop: 30 }}>Добавить новый тип</h3>
    <DataTable data={[newRow]} columns={editColumns} />
</WideWidget>
);
};

export default FI_OverheadTypes;