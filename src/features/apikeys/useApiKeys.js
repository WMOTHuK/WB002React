import { useState, useEffect, useContext, useCallback } from 'react';
import { UserContext } from '../../context/UserContext';
import { fetchApiKeyTypes, fetchUserApiKeys, saveUserApiKey } from './apikeysService';

export function useApiKeys() {
  const { userData } = useContext(UserContext);

  // Состояния
  const [apiKeyTypes, setApiKeyTypes] = useState([]);
  const [userApiKeys, setUserApiKeys] = useState([]);
  const [inputValues, setInputValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Загрузка данных при монтировании
  useEffect(() => {
    // Выходим, если нет логина (пользователь не авторизован)
    if (!userData?.userInfo?.login) return;

    let cancelled = false; // флаг для предотвращения утечек памяти

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const token = userData.userInfo.token;
        const userId = userData.userInfo.login;

        // Запрашиваем параллельно (они не зависят друг от друга)
        const [types, keys] = await Promise.all([
          fetchApiKeyTypes(token),
          fetchUserApiKeys(userId, token)
        ]);

        // Если компонент размонтирован — не обновляем состояние
        if (cancelled) return;

        setApiKeyTypes(types);
        setUserApiKeys(keys);

        // Строим начальные значения для полей ввода (всегда пустые)
        const initialValues = {};
        types.forEach(type => {
          initialValues[type.key_type] = '';
        });
        setInputValues(initialValues);

      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    // Cleanup-функция: если компонент размонтируется, запросы не обновят состояние
    return () => {
      cancelled = true;
    };
  }, [userData]);

  // Обработчик изменения поля ввода
  const handleInputChange = useCallback((keyType, value) => {
    setInputValues(prev => ({ ...prev, [keyType]: value }));
    // Сбрасываем ошибку при вводе
    setError(null);
  }, []);

  // Обработчик сохранения ключа
  const handleSaveKey = useCallback(async (keyType) => {
    try {
      const keyValue = inputValues[keyType];

      // Валидация
      if (!keyValue || !keyValue.trim()) {
        setError('Пожалуйста, введите ключ');
        return;
      }

      setError(null);
      setSuccessMessage(null);

      const token = userData.userInfo.token;
      const userId = userData.userInfo.userId;

      // Вызываем сервис
      await saveUserApiKey(userId, keyType, keyValue, token);

      // Обновляем локальное состояние
      const updatedKey = {
        key_type: keyType,
        updated_at: new Date().toISOString()
      };

      setUserApiKeys(prev => {
        const exists = prev.find(k => k.key_type === keyType);
        return exists
          ? prev.map(k => k.key_type === keyType ? updatedKey : k)
          : [...prev, updatedKey];
      });

      // Очищаем поле ввода после сохранения
      setInputValues(prev => ({ ...prev, [keyType]: '' }));

      // Показываем сообщение об успехе
      setSuccessMessage(`Ключ "${keyType}" сохранён. ${new Date().toLocaleString()}`);

    } catch (err) {
      setError(err.message);
    }
  }, [inputValues, userData]);

  // Сброс сообщения об успехе
  const clearSuccess = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  // Возвращаем только то, что нужно компоненту
  return {
    // Данные
    apiKeyTypes,
    userApiKeys,
    inputValues,
    // Состояния
    loading,
    error,
    successMessage,
    // Действия
    handleInputChange,
    handleSaveKey,
    clearSuccess,
  };
}