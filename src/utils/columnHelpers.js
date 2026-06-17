// src/utils/columnHelpers.js
import React from 'react';

/**
 * Creates a custom column config for an action icon.
 *
 * @param {string}   accessorKey  – field to replace
 * @param {function} onAction     – async (row) => void
 * @param {object}   icons        – { loading: JSX, true: JSX, false: JSX, success: JSX }
 * @param {number}   width        – column width
 * @returns {function} – mapper (col) => col
 */
export function withActionIcon(accessorKey, onAction, icons = {}, width = 80) {
  const {
    loading = <span>⏳</span>,
    true: iconTrue = <span style={{ cursor: 'pointer', fontSize: 18 }} title="Обновить">🔄</span>,
    false: iconFalse = <span style={{ cursor: 'pointer', fontSize: 18 }} title="Скачать">⬇️</span>,
    success = <span style={{ fontSize: 18 }}>✅</span>,
    error = <span style={{ fontSize: 18, color: 'red' }}>❌</span>,
  } = icons;

  return function (col, getLoadingId, setLoadingId, getSuccessId, setSuccessId, getErrorId, setErrorId) {
    if (col.accessorKey === accessorKey) {
      return {
        ...col,
        type: 'custom',
        sortable: false,
        width,
        cellRender: (value, row) => {
          const id = row.report_id;
          const loadingId = getLoadingId ? getLoadingId() : null;
          const successId = getSuccessId ? getSuccessId() : null;
          const errorId = getErrorId ? getErrorId() : null;

          if (loadingId === id) {
            return loading;
          }
          if (errorId === id) {
            return error;
          }
          if (successId === id) {
            return success;
          }

          return (
            <span
              style={{ cursor: 'pointer', fontSize: 18 }}
                onClick={(e) => {
                e.stopPropagation();
                if (setLoadingId) {
                    setLoadingId(id);
                }
                onAction(row)
                    .finally(() => {
                    if (setLoadingId) {
                        setLoadingId(null);
                    }
                    });
                }}
            >
              {value ? iconTrue : iconFalse}
            </span>
          );
        },
      };
    }
    return col;
  };
}
