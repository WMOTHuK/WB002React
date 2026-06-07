// src/hooks/useOverheadTypes.js
import { useState, useEffect, useCallback, useContext } from 'react';
import { UserContext } from '../context/context';
import { fetchOverheadTypes, addOverheadType } from '../services/api/financeService';

export function useOverheadTypes() {
  const userdata = useContext(UserContext);
  const token = userdata.userData?.userInfo?.token;
  const locale = userdata.userData?.locale || 'RU';

  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTypes = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOverheadTypes(locale, token);
      setTypes(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [token, locale]);

  useEffect(() => {
    loadTypes();
  }, [loadTypes]);

  const addType = useCallback(async ({ name, description }) => {
    setError(null);
    try {
      await addOverheadType({ name, description, locale }, token);
      await loadTypes(); // перезагружаем список
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setError(msg);
      return { success: false, error: msg };
    }
  }, [token, locale, loadTypes]);

  return { types, loading, error, addType, loadTypes };
}