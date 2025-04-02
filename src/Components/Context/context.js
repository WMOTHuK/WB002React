// context.js

// Контекст для данных пользователя
import React, { createContext, useState } from 'react';
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    apiKeys: null,
    userInfo: null,
    locale: 'RU'
  });

  const initApiKeys = async (token) => {
    try {
      const response = await fetch('/api/auth/api-keys', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Ошибка получения ключей');
      
      const apiKeys = await response.json();
      
      setUserData(prev => ({
        ...prev,
        apiKeys,
        userInfo: { token }
      }));
      
      return apiKeys;
    } catch (error) {
      console.error('Ошибка инициализации ключей:', error);
      throw error;
    }
  };

  const logout = () => {
    setUserData({
      apiKeys: null,
      userInfo: null,
      locale: 'RU'
    });
  };

  return (
    <UserContext.Provider value={{ userData, initApiKeys, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Контекст для общих данных приложения
export const appContext = React.createContext({
  apiSettings: {},
  globalConfig: {},
  staticData: {}
});