// src/context/context.js
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
        const decoded = parseJwt(token);
        if (!decoded?.login) throw new Error('Invalid token');
        setUserData(prev => ({
          ...prev,
          userInfo: { 
            token,
            login: decoded.login,
            userId: decoded.userId
          }
        }));
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('wb_token');
        setUserData(prev => ({ ...prev, userInfo: null })); // ← добавь
      } finally {
        setAuthChecked(true); // ← теперь после try/catch, userInfo уже установлен
      }
    };
    checkAuth();
}, []);

  // Обновленный метод login с передачей userId
  const login = (token, username, userId) => {
    localStorage.setItem('wb_token', token);
    setUserData(prev => ({
      ...prev,
      userInfo: {
        token,
        login: username,
        userId: userId // Сохраняем userId
      },
      apiKeys: null 
    }));
  };
  
  const logout = () => {
    localStorage.removeItem('wb_token');
    setUserData({
/*       apiKeys: null, */
      userInfo: null,
      locale: 'RU'
    });
  };

  return (
    <UserContext.Provider value={{ 
      userData, 
      logout,
      login, 
      authChecked
    }}>
      {authChecked ? children : <div>Проверка авторизации...</div>}
    </UserContext.Provider>
  );
};