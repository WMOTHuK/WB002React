// Components/login/login.js
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../Context/context';
import styles from '../../CSS/styles.module.css';
import WideWidget from '../Vidgets/WideWidget';

const Login = () => {
  
  const { userData, login } = useContext(UserContext);
  const [credentials, setCredentials] = useState({ login: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!userData) return null;
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
  
      if (!response.ok) throw new Error('Неверные учетные данные');
  
      const { token, login: username } = await response.json();
      await login(token, username); // Передаём оба параметра
      navigate('/goods');
    } catch (err) {
      setError(err.message);
      console.error('Ошибка авторизации:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (userData.apiKeys) {
    // Если пользователь уже авторизован
    return (
      <div className={styles.pagecontainer}>
        <div className={styles.vidget}>
          <h2>Добро пожаловать!</h2>
          <p>Вы авторизованы в системе.</p>
        </div>
      </div>
    );
  }

  // Форма авторизации
  return (
    <WideWidget>
        <h2>Авторизация</h2>
        {error && <p className={styles.error}>{error}</p>}
        
        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label>Логин:</label>
            <input
              type="text"
              value={credentials.login}
              onChange={(e) => setCredentials({...credentials, login: e.target.value})}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Пароль:</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className={styles.primaryButton}
            disabled={isLoading}>

            {isLoading ? 'Вход...' : 'Войти'}
           </button>
           <div className={styles.authLink}>
            Нет аккаунта? <a href="/register">Зарегистрируйтесь</a>
           </div>
        </form>

     </WideWidget>
  );
};

export default Login;