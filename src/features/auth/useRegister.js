// src/features/auth/useRegister.js

import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/context';
import { registerUser, loginUser } from './authService';

export function useRegister() {
  const navigate = useNavigate();
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

  const hasErrors = Object.keys(validationErrors).length > 0;


  const validateField = (name, value) => {
    setValidationErrors((prev) => {
      const errors = { ...prev };

      if (name === 'login') {
        if (value.length > 0 && value.length < 3) {
          errors.login = 'Логин слишком короткий';
        } else {
          delete errors.login;
        }
      }

      if (name === 'password') {
        if (value.length > 0 && value.length < 6) {
          errors.password = 'Пароль слишком короткий';
        } else {
          delete errors.password;
        }
      }

      if (name === 'confirmPassword') {
        if (value !== formData.password) {
          errors.confirmPassword = 'Пароли не совпадают';
        } else {
          delete errors.confirmPassword;
        }
      }

      return errors;
    });
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    validateField(name, value);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return setStatus({ loading: false, error: 'Пароли не совпадают', success: null });
    }

    if (formData.password.length < 6) {
      return setStatus({ loading: false, error: 'Пароль должен содержать минимум 6 символов', success: null });
    }

    setStatus({ loading: true, error: null, success: null });

    try {
      await registerUser(formData.login, formData.password);
      const { token } = await loginUser(formData.login, formData.password);

      setFormData({ login: '', password: '', confirmPassword: '' });
      setValidationErrors({});

      setStatus({
        loading: false,
        error: null,
        success: 'Регистрация прошла успешно! Вы будете перенаправлены...'
      });

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

  return {
    formData,
    validationErrors,
    status,
    hasErrors,
    handleChange,
    handleSubmit,
  };
}