import axios from 'axios';

const insertrow = async ( tablename, rowData) => {
    try {
        const url = '/api/insertrow'
        const zdata = {
            tablename,
            rowData
        };
        const response = await axios.post(url, zdata);
        console.log('Ответ сервера:', response.data); // Выводим в консоль для проверки
        debugger;
        return response.data.message; // Возвращаем данные, полученные от сервера
    } catch (error) {
        console.error('Ошибка при отправке данных на сервер:', error);
        debugger;
        return error.response.data.message;
    }
  };
  export default insertrow;
