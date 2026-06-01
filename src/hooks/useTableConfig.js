// src/hooks/useTableConfig.js

import { useState, useCallback } from 'react';
import { getTableKeys } from '../utils/tableHelpers';
import { getTableLocale } from '../services/api/tableService';
import { buildTableConfig } from '../utils/buildTableConfig';

/**
 * Hook that takes raw data and returns ready-to-use columns for DataTable.
 *
 * @param {function} navigate  – react-router navigate
 * @param {string}   locale    – user locale ('RU', 'EN', etc.)
 * @param {string}   mode      – 'view' | 'edit'
 * @returns {{
 *   columns:     object[],
 *   loading:     boolean,
 *   error:       string | null,
 *   buildConfig: (data, onDataChange?) => Promise<void>
 * }}
 */
export function useTableConfig(navigate, locale = 'RU', mode = 'view', token) {
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const buildConfig = useCallback(async (data, onDataChange) => {
    setLoading(true);
    setError(null);

    try {
      const keys = getTableKeys(data);
      const translations = await getTableLocale(keys, locale, token);
      console.log('Translations:', translations);
      console.log('Is array:', Array.isArray(translations));

      const onChange = onDataChange
        ? (field, value, row) => onDataChange(field, value, row)
        : undefined;

      const cols = buildTableConfig({
        keys,
        translations,
        mode,
        navigate,
        onChange,
      });

      setColumns(cols);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate, locale, mode]);

  return { columns, loading, error, buildConfig };
}
