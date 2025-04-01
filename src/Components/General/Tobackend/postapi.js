
  
import axios from 'axios';

const postapi = async  (url, tablename, fieldsToUpdate, rowData) => {
    try {
        const response = await axios.post(url, tablename, fieldsToUpdate, rowData);
        console.log('Ответ сервера:', response.data); // Выводим в консоль для проверки
        debugger;
        return response.data; // Возвращаем данные, полученные от сервера
    } catch (error) {
        console.error('Ошибка при отправке данных на сервер:', error);
        return error.message;
    }
  };
  export default postapi;