import axios from 'axios';


async function fetchgoods  (url, apikey)  {
const response = await axios.post(url, {
    // Тело запроса
    settings: {
      sort: {
        ascending: false
      },
      filter: {
        textSearch: "",
        allowedCategoriesOnly: true,
        tagIDs: [],
        objectIDs: [],
        brands: [],
        imtID: 0,
        withPhoto: -1
      },
      cursor: {
        updatedAt: null,
        nmID: 0,
        limit: 99
      }
    }
  }, {
    // Заголовки
    headers: {
      'Authorization': `Bearer ${apikey}`
    }
  })

// Проверяем статус ответа
if (response.status !== 200) {
  debugger;
    throw new Error(`Данные из Вайлдберриз не получены. Статус: ${response.status}`);
}
return response.data;

};

export default fetchgoods;