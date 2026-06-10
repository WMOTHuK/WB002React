import React, { useState, useCallback } from 'react';

/**
 * Hook for tracking changed rows and saving them one by one.
 *
 * @param {function} saveFn       – async (row) => void, custom save logic
 * @param {function} getRowId     – (row) => string, unique row identifier
 * @returns {{
 *   changedRows: Set,
 *   savingRows:  Set,
 *   savedRows:   Set,
 *   markChanged: (row) => void,
 *   saveRow:     (row) => Promise<void>,
 *   actionsColumn: object – pre-built column config for DataTable
 * }}
 */
export function useRowSave({ saveFn, getRowId }) {
  const [changedRows, setChangedRows] = useState(new Set());
  const [savingRows, setSavingRows] = useState(new Set());
  const [savedRows, setSavedRows] = useState(new Set());

  const markChanged = useCallback((row) => {
    const id = getRowId(row);
    setChangedRows(prev => new Set(prev).add(id));
    setSavedRows(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, [getRowId]);

  const saveRow = useCallback(async (row, originalRow) => {
  const id = getRowId(row);
  setSavingRows(prev => new Set(prev).add(id));

  try {
      const result = await saveFn(row, originalRow);

      if (result.success) {
        setChangedRows(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setSavedRows(prev => new Set(prev).add(id));
      } else {
        // Показываем ошибку, кнопка остаётся
        console.error('Save error:', result.error);
        alert(result.error); // или свой UI для ошибок
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSavingRows(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [saveFn, getRowId]);
  const actionsColumn = {
    accessorKey: '_actions',
    header: '',
    type: 'custom',
    width: 50,
    sortable: false,
    cellRender: (_, row) => {
      const id = getRowId(row);
      if (savingRows.has(id)) return <span>⏳</span>;
      if (savedRows.has(id)) return <span>✅</span>;
      if (changedRows.has(id)) return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            saveRow(row);
          }}
          style={{ background: 'none', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer', padding: '2px 6px' }}
        >
          💾
        </button>
      );
      return null;
    },
  };

  return {
    changedRows,
    savingRows,
    savedRows,
    markChanged,
    saveRow,
    actionsColumn,
  };
}