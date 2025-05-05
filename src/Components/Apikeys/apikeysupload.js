//.src/components/Apikeys/apikeysupload.js

import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../Context/context';
import WideWidget from '../Vidgets/WideWidget';
import styles from '../../CSS/styles.module.css';

const Apikeysupload = () => {
  const { userData } = useContext(UserContext);
  const [apiKeyTypes, setApiKeyTypes] = useState([]);
  const [userApiKeys, setUserApiKeys] = useState([]);
  const [inputValues, setInputValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const typesResponse = await fetch('/api/auth/getapikeytypes', {
          headers: {
            'Authorization': `Bearer ${userData.userInfo.token}`
          }
        });

        if (!typesResponse.ok) throw new Error('Ошибка загрузки типов ключей');
        const typesData = await typesResponse.json();
        setApiKeyTypes(typesData);

        const keysResponse = await fetch(`/api/auth/getuserapikeysdata?user_id=${userData.userInfo.login}`, {
          headers: {
            'Authorization': `Bearer ${userData.userInfo.token}`
          }
        });
        if (!keysResponse.ok) throw new Error('Ошибка загрузки ключей пользователя');
        const keysData = await keysResponse.json();
        setUserApiKeys(keysData);

        const initialValues = {};
        typesData.forEach(type => {
          const userKey = keysData.find(k => k.key_type === type.key_type);
          initialValues[type.key_type] = userKey ? '' : ''; // Теперь всегда пустая строка
        });
        setInputValues(initialValues);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userData?.userInfo?.login) {
      fetchData();
    }
  }, [userData]);

  const handleInputChange = (keyType, value) => {
    setInputValues(prev => ({
      ...prev,
      [keyType]: value
    }));
  };

  const handleSaveKey = async (keyType) => {
    try {
      const keyValue = inputValues[keyType];
      if (!keyValue.trim()) {
        setError('Пожалуйста, введите ключ');
        return;
      }

      const response = await fetch('/api/auth/saveuserapikey', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.userInfo.token}`
        },
        body: JSON.stringify({
          user_id: userData.userInfo.userId,
          key_type: keyType,
          api_key: keyValue
        })
      });

      if (!response.ok) throw new Error('Ошибка сохранения ключа');

      const updatedKey = {
        key_type: keyType,
        updated_at: new Date().toISOString()
      };
      
      setUserApiKeys(prev => {
        const existing = prev.find(k => k.key_type === keyType);
        return existing 
          ? prev.map(k => k.key_type === keyType ? updatedKey : k)
          : [...prev, updatedKey];
      });

      setError(null);
      alert(`Ключ успешно сохранён/обновлён. Последнее обновление: ${new Date().toLocaleString()}`);

    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div className={styles.error}>Ошибка: {error}</div>;

  return (
    <WideWidget title="Загрузка API ключей">
      <div className={styles.apiKeysContainer}>
        {apiKeyTypes.map((type) => {
          const userKey = userApiKeys.find(k => k.key_type === type.key_type);
          const isExisting = !!userKey;
          
          return (
            <div key={type.key_type} className={styles.apiKeyBlock}>
              <h3>{type.key_text}</h3>
              {isExisting && (
                <p className={styles.keyInfo}>
                  Ключ уже существует, последнее обновление: {new Date(userKey.updated_at).toLocaleString()}
                </p>
              )}
              <textarea
                value={inputValues[type.key_type] || ''}
                onChange={(e) => handleInputChange(type.key_type, e.target.value)}
                placeholder="Введите API ключ..."
                className={styles.apiKeyInput}
                maxLength={500}
                rows={5}
                cols={100}
              />
              <button
                onClick={() => handleSaveKey(type.key_type)}
                className={styles.saveButton}
              >
                {isExisting ? 'Обновить ключ' : 'Сохранить ключ'}
              </button>
            </div>
          );
        })}
      </div>
    </WideWidget>
  );
};

export default Apikeysupload;