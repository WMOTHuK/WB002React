// Context/context.js
// Контекст для данных пользователя
import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();


const parseJwt = (token) => {
  try {
    // Достаём payload из JWT токена (вторая часть после разделителя '.')
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch (e) {
    return null;
  }
};

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    apiKeys: null,
    userInfo: null,
    locale: 'RU'
  });
  const [authChecked, setAuthChecked] = useState(false); // Флаг проверки авторизации

  // Проверка токена при монтировании компонента
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('wb_token');
      if (!token) {
        setAuthChecked(true);
        return;
      }
  
      try {
        // Парсим токен на клиенте
        const decoded = parseJwt(token);
        if (!decoded?.login) throw new Error('Invalid token');
        
        const apiKeys = await initApiKeys(token);
        setUserData(prev => ({
          ...prev,
          apiKeys,
          userInfo: { 
            token,
            login: decoded.login // Берём логин из распаршенного токена
          }
        }));
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('wb_token');
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, []);
  const initApiKeys = async (token) => {
    try {
      const response = await fetch('/api/auth/api-keys', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Ошибка получения ключей');
      
      const apiKeys = await response.json();
      
      setUserData(prev => ({
        ...prev, 
        apiKeys 
      }));
      
      return apiKeys;
    } catch (error) {
      console.error('Ошибка инициализации ключей:', error);
      throw error;
    }
  };

  const login = (token, username) => {
    localStorage.setItem('wb_token', token);
    setUserData(prev => ({
      ...prev,
      userInfo: {
        token,
        login: username 
      },
      apiKeys: null 
    }));
    return initApiKeys(token); 
  };

  const logout = () => {
    localStorage.removeItem('wb_token');
    setUserData({
      apiKeys: null,
      userInfo: null,
      locale: 'RU'
    });
  };

  return (
    <UserContext.Provider value={{ 
      userData, 
      initApiKeys, 
      logout,
      login,
      authChecked
    }}>
      {authChecked ? children : <div>Проверка авторизации...</div>}
    </UserContext.Provider>
  );
};

// Контекст для общих данных приложения
export const appContext = React.createContext({
  apiSettings: {},
  globalConfig: {},
  staticData: {}
});