import axios from 'axios';

export const gettablefrombd = async (tablename) => {
    // Формирование URL с использованием шаблонной строки и переменной tablename
    const url = `/api/gettable?tablename=${encodeURIComponent(tablename)}`;

    try {
        const response = await axios.get(url);
        return response.data; // Возвращаем данные, полученные от сервера
    } catch (error) {
        console.error('Ошибка при отправке данных на сервер:', error);
        return 'Ошибка при отправке данных на сервер:';
    }
};

export const gettablelocale = async (tablekeys, locale) => {
      // Использование URLSearchParams для формирования параметров запроса
  const params = new URLSearchParams({
    tablekeys: tablekeys.join(','), // Преобразуем массив в строку, разделенную запятыми
    locale: locale
  }).toString();

  // Формирование URL для запроса
  const url = `/api/gettablelocale?${params}`;
    try {
    const response = await axios.get(url);
    return response.data; // Возвращаем данные, полученные от сервера
} catch (error) {
    return ('Ошибка при отправке данных на сервер:')
}};