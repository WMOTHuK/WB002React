import axios from 'axios';

export const fetchApiKeys = async (token) => {
  try {
    const response = await axios.get('/api/auth/api-keys', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка получения ключей:', error);
    throw error;
  }
};