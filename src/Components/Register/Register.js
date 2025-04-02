import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../Context/context';
import styles from '../../CSS/styles.module.css';

const Register = () => {
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    confirmPassword: ''
  });
  const [status, setStatus] = useState({
    loading: false,
    error: null,
    success: null
  });
  const navigate = useNavigate();
  const { initApiKeys } = useContext(UserContext);

  const validateField = (name, value) => {
    const errors = {};
    
    if (name === 'login' && value.length > 0 && value.length < 3) {
      errors.login = 'Логин слишком короткий';
    }
    
    if (name === 'password' && value.length > 0 && value.length < 6) {
      errors.password = 'Пароль слишком короткий';
    }
    
    if (name === 'confirmPassword' && value !== formData.password) {
      errors.confirmPassword = 'Пароли не совпадают';
    }
    
    setValidationErrors(prev => ({
      ...prev,
      ...errors
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    validateField(name, value); // Добавьте этот вызов
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация на клиенте
    if (formData.password !== formData.confirmPassword) {
      return setStatus({
        ...status,
        error: 'Пароли не совпадают'
      });
    }

    if (formData.password.length < 6) {
      return setStatus({
        ...status,
        error: 'Пароль должен содержать минимум 6 символов'
      });
    }

    setStatus({ loading: true, error: null, success: null });

    try {
      // 1. Регистрация
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: formData.login,
          password: formData.password
        })
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        throw new Error(errorData.message || 'Ошибка регистрации');
      }

      // 2. Автоматический вход после регистрации
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: formData.login,
          password: formData.password
        })
      });

      if (!loginResponse.ok) {
        throw new Error('Ошибка автоматического входа после регистрации');
      }

      const { token } = await loginResponse.json();
      await initApiKeys(token);
    
      // Успешная регистрация и вход

      // Очистка формы
      setFormData({
        login: '',
        password: '',
        confirmPassword: ''
      }); 

      
      setStatus({
        loading: false,
        error: null,
        success: 'Регистрация прошла успешно! Вы будете перенаправлены...'
      });

      // Перенаправление с задержкой
      setTimeout(() => {
        navigate('/goods');
      }, 2000);

    } catch (err) {
      setStatus({
        loading: false,
        error: err.message,
        success: null
      });
    }
  };

  return (
    <div className={styles.pagecontainer}>
      <div className={styles.vidget}>
        <h2>Регистрация</h2>
        
        {/* Блок ошибок */}
        {status.error && (
          <div className={`${styles.alert} ${styles.error}`}>
            {status.error}
          </div>
        )}
        
        {/* Блок успешной регистрации */}
        {status.success && (
          <div className={`${styles.alert} ${styles.success}`}>
            {status.success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Логин:</label>
            <input
            type="text"
            name="login"
            value={formData.login}
            onChange={handleChange}
            required
            minLength={3}
            disabled={status.loading || status.success}
            autoFocus // Добавьте этот атрибут
            />
              {validationErrors.login && (
                <div className={styles.fieldError}>{validationErrors.login}</div>
                )
              }
          </div>
          
          <div className={styles.formGroup}>
            <label>Пароль:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              disabled={status.loading || status.success}
            />
              {validationErrors.password && (
                <div className={styles.fieldError}>{validationErrors.password}</div>
                )}
          </div>
          
          <div className={styles.formGroup}>
            <label>Подтвердите пароль:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={status.loading || status.success}
            />
            {validationErrors.confirmPassword && (
            <div className={styles.fieldError}>{validationErrors.confirmPassword}</div>
            )}
          </div>
          
          <button 
            type="submit" 
            className={styles.primaryButton}
            disabled={status.loading || status.success}
          >
            {status.loading ? 'Регистрация...' : 
             status.success ? 'Успешно!' : 'Зарегистрироваться'}
          </button>
        </form>
        
        <div className={styles.authLink}>
          Уже есть аккаунт? <a href="/login">Войти</a>
        </div>
      </div>
    </div>
  );
};

export default Register;