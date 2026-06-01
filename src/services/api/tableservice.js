// tableservice.js
import axios from 'axios';

export const getTableFromDB = async (tablename) => {
    // Формирование URL с использованием шаблонной строки и переменной tablename
    const url = `/api/DB/gettable?tablename=${encodeURIComponent(tablename)}`;

    try {
        const response = await axios.get(url);
        return response.data; // Возвращаем данные, полученные от сервера
    } catch (error) {
        console.error('Ошибка при отправке данных на сервер:', error);
        return 'Ошибка при отправке данных на сервер:';
    }
};

export const getTableLocale = async (tablekeys, locale) => {
      // Использование URLSearchParams для формирования параметров запроса
  const params = new URLSearchParams({
    tablekeys: tablekeys.join(','), // Преобразуем массив в строку, разделенную запятыми
    locale: locale
  }).toString();

  // Формирование URL для запроса
  const url = `/api/DB/gettablelocale?${params}`;
    try {
    const response = await axios.get(url);
    return response.data; // Возвращаем данные, полученные от сервера
} catch (error) {
    return ('Ошибка при отправке данных на сервер:')
}};

export const insertrow = async ( tablename, rowData) => {
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

/*   const postapi = async  (url, tablename, fieldsToUpdate, rowData) => {
    try {
        const response = await axios.post(url, tablename, fieldsToUpdate, rowData);
        console.log('Ответ сервера:', response.data); // Выводим в консоль для проверки
        debugger;
        return response.data; // Возвращаем данные, полученные от сервера
    } catch (error) {
        console.error('Ошибка при отправке данных на сервер:', error);
        return error.message;
    }
  }; */


export  const sendDataToBackend = async (url, data) => {
  try {
      const response = await axios.post(url, data);
      return response.data; // Возвращаем данные, полученные от сервера
  } catch (error) {
      console.error('Ошибка при отправке данных на сервер:', error);
      return error.message;
  }
};

export const updateRow = async (tablename, tablekey, fieldsToUpdate, rowData) => {
    try {
        const url = '/api/updaterow';
        const response = await axios.post(url, {
            tablename,
            tablekey,
            fieldsToUpdate,
            rowData
        });
        return response.data.message;
    } catch (error) {
        console.error('Ошибка при отправке данных на сервер:', error);
        return error.response.data.message;
    }
};