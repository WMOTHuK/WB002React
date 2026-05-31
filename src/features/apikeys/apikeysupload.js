import React, { useEffect } from 'react';
import WideWidget from '../../components/ui/WideWidget';
import { useApiKeys } from './useApiKeys';
import styles from '../../styles/styles.module.css';

const ApikeysUpload = () => {
  const {
    apiKeyTypes,
    userApiKeys,
    inputValues,
    loading,
    error,
    successMessage,
    handleInputChange,
    handleSaveKey,
    clearSuccess,
  } = useApiKeys();

  // Автоскрытие сообщения об успехе через 5 секунд
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(clearSuccess, 5000);
    return () => clearTimeout(timer);
  }, [successMessage, clearSuccess]);

  // Ранние возвраты
  if (loading) return <div className={styles.loading}>Загрузка...</div>;

  // Основной рендер
  return (
    <WideWidget title="Загрузка API ключей">
      <div className={styles.apiKeysContainer}>
        {/* Сообщение об ошибке */}
        {error && (
          <div className={styles.error} onClick={() => {}}>
            Ошибка: {error}
          </div>
        )}

        {/* Сообщение об успехе */}
        {successMessage && (
          <div className={styles.success}>
            {successMessage}
          </div>
        )}

        {/* Список типов ключей */}
        {apiKeyTypes.map((type) => {
          const userKey = userApiKeys.find(k => k.key_type === type.key_type);
          const hasExistingKey = !!userKey;

          return (
            <div key={type.key_type} className={styles.apiKeyBlock}>
              <h3>{type.key_text}</h3>

              {hasExistingKey && (
                <p className={styles.keyInfo}>
                  Последнее обновление: {new Date(userKey.updated_at).toLocaleString()}
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
                {hasExistingKey ? 'Обновить ключ' : 'Сохранить ключ'}
              </button>
            </div>
          );
        })}
      </div>
    </WideWidget>
  );
};

export default ApikeysUpload;