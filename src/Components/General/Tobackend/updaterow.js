import axios from 'axios';

const updaterow = async ( tablename, tablekey, fieldsToUpdate, rowData) => {
    try {
        const url = '/api/updaterow'
        const zdata = {
            tablename,
            tablekey,
            fieldsToUpdate,
            rowData
        };
        const response = await axios.post(url, zdata);
        console.log('Ответ сервера:', response.data); // Выводим в консоль для проверки
        return response.data.message; // Возвращаем данные, полученные от сервера
    } catch (error) {
        console.error('Ошибка при отправке данных на сервер:', error);
        return error.response.data.message;
    }
  };
  export default updaterow;
