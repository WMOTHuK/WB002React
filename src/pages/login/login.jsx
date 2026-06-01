// src/pages/login/login.jsx
import React, { useContext } from 'react';
import { UserContext } from '../../context/context';
import { useLogin } from '../../features/auth/useLogin';
import WideWidget from '../../components/ui/widewidget/WideWidget';
import styles from '../../styles/styles.module.css';

const Login = () => {
    const { userData } = useContext(UserContext);
    const { credentials, isLoading, error, handleChange, handleLogin } = useLogin();

    if (!userData) return null;

    if (userData.apiKeys) {
        return (
            <div className={styles.pagecontainer}>
                <div className={styles.vidget}>
                    <h2>Добро пожаловать!</h2>
                    <p>Вы авторизованы в системе.</p>
                </div>
            </div>
        );
    }

    return (
        <WideWidget>
            <h2>Авторизация</h2>
            {error && <p className={styles.error}>{error}</p>}

            <form onSubmit={handleLogin}>
                <div className={styles.formGroup}>
                    <label>Логин:</label>
                    <input
                        type="text"
                        name="login"
                        value={credentials.login}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Пароль:</label>
                    <input
                        type="password"
                        name="password"
                        value={credentials.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={isLoading}
                >
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