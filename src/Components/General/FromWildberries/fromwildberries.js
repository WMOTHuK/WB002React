/* import axios from 'axios';

export const fetchWBdata = async (url, apikey) => {

  const response = await axios.get(url, {
    
    headers: {
      'Authorization': `Bearer ${apikey}`
    }
  });

  // Проверяем статус ответа
  if (response.status !== 200) {
    throw new Error(`Данные из Вайлдберриз не получены. Статус: ${response.status}`);
  }

  return response.data;
};

 */