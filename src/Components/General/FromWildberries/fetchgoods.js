/* import axios from 'axios';
import { useContext } from 'react';
import { UserContext } from '../../Context/context.js'
const { userData } = useContext(UserContext);

async function fetchgoods  (url)  {
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
      'Authorization': `Bearer ${contentAPIKEY}`
    }
  })

// Проверяем статус ответа
if (response.status !== 200) {
  debugger;
    throw new Error(`Данные из Вайлдберриз не получены. ${response.data}`);
}
return response.data;

};

export default fetchgoods; */