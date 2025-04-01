
import axios from 'axios';

const sendDataToBackend = async (url, data) => {
  try {
      const response = await axios.post(url, data);
      return response.data; // Возвращаем данные, полученные от сервера
  } catch (error) {
      console.error('Ошибка при отправке данных на сервер:', error);
      return error.message;
  }
};
export default sendDataToBackend;


