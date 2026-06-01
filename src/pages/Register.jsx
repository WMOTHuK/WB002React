import React from 'react';
import { useRegister } from '../features/auth/useRegister';
import styles from '../styles/styles.module.css';

const Register = () => {
  const {
    formData,
    validationErrors,
    status,
    hasErrors,
    handleChange,
    handleSubmit,
  } = useRegister();
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
            <label>Логин(e-mail):</label>
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
            disabled={status.loading || status.success || hasErrors}
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