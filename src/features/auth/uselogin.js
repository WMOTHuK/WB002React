// src/features/auth/useLogin.js
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/context';
import { loginUser } from './authService';

export function useLogin() {
    const { login } = useContext(UserContext);
    const navigate = useNavigate();

    const [credentials, setCredentials] = useState({ login: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { token, login: username, userId } = await loginUser(
                credentials.login,
                credentials.password
            );
            await login(token, username, userId);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        credentials,
        isLoading,
        error,
        handleChange,
        handleLogin,
    };
}