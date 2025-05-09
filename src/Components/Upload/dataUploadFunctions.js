// Upload/dataUploadFunctions.js
import axios from 'axios';
import { useContext } from 'react';
import saveandupdate from '../General/saveandupdate';
import { gettableKeys } from '../General/tableactions';
import { UserContext } from "../Context/context.js";



const crm_url = 'https://advert-api.wb.ru/adv/v1/promotion/count';

/**
 * Универсальная функция для GET-запросов к API Wildberries
 * @param {Object} params - Параметры запроса
 * @returns {Promise} - Результат запроса
 */
export const WB_get_request = async (globalData, apikeys, params = {}) => {
  try {
    const response = await axios.get(crm_url, {
      headers: {
        'Authorization': `Bearer ${apikeys.apikeycrm}`,
        'Content-Type': 'application/json'
      },
      params
    });
    return response.data;
  } catch (err) {
    throw new Error(`WB API request failed: ${err.response?.data?.message || err.message}`);
  }
};


function processCards(wbData) {
  if (!Array.isArray(wbData)) {
    throw new Error("wbData is not an array");
  }

  const singleFields = [];
  const photos = [];

  // Определение ключей, которые нужно включить в singleFields
  const includedKeys = ['nmID', 'imtID', 'subjectID', 'subjectName', 'vendorCode', 'brand', 'title'];

  

  wbData.forEach(card => {
    const cardSingleFields = {};

    Object.entries(card).forEach(([key, value]) => {
      // Преобразование ключа к нижнему регистру
      const keyLowerCase = key.toLowerCase();

      if (key === 'photos' && Array.isArray(value)) {
        // Обработка массива фотографий
        const firstPhotoSmall = value.length > 0 ? value[0].tm : null;
        const firstPhotoBig = value.length > 0 ? value[0].big : null;
        if (firstPhotoSmall) {
          photos.push({ nmid: card.nmID, small: firstPhotoSmall, big: firstPhotoBig }); // Используем nmID из входных данных
        } else {}
      } else if (includedKeys.includes(key)) {
        // Включение поля, если его ключ в списке разрешенных
        cardSingleFields[keyLowerCase] = value;
      }
    });

    if (Object.keys(cardSingleFields).length > 0) {
      singleFields.push(cardSingleFields);
    }
  });

  return { singleFields, photos };
}
export const downloadGoodsData = async (userContext, setStatus) => {
  try {
    const token = userContext.userData.userInfo.token;
    setStatus(prevStatus => [...prevStatus, `Запуск процедуры по товарам`]);
    
    let goodsData; // Объявляем переменную в общей области видимости
    
    try {
      const response = await fetch('/api/content/getgoodsdata', {
        headers: {
          'Authorization': `Bearer ${userContext.userData.userInfo.token}`
        }
      });
    
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    
      goodsData = await response.json(); // Присваиваем значение
    } catch (error) {
      console.error('Error fetching goods data:', error);
      throw error; // Пробрасываем ошибку дальше
    }

    // Теперь goodsData доступна в этой области видимости
    const { singleFields: goods, photos } = processCards(goodsData);
    
    setStatus(prevStatus => [...prevStatus, `Данные из Вайлдберриз получены успешно(Товары)`]);


    const responsegods = await axios.post('/api/DB/updatetable', {
      rows: goods,
      tableName: 'goods',
      keyFields: 'nmid'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    setStatus(prevStatus => [...prevStatus, responsegods.data.message]);

    const responsephoto = await axios.post('/api/DB/updatetable', {
      rows: photos,
      tableName: 'photos',
      keyFields: 'nmid'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    setStatus(prevStatus => [...prevStatus, responsephoto.data.message]);
/* 
    await saveandupdate(goods, 'nmid', gettableKeys(goods), 'goods');
    await saveandupdate(photos, 'nmid', gettableKeys(photos), 'photos');
 */


    setStatus(prevStatus => [...prevStatus, `Данные из Вайлдберриз обновлены(Товары)`]);
  } catch (error) {
    setStatus(prevStatus => [...prevStatus, 
      `Ошибка при загрузке данных(uploadGoodsData): ${error.response?.data?.detail || error.message}`
    ]);
    throw error; // Пробрасываем ошибку для обработки выше
  }
  
  return setStatus;
};

export const getCompaigns = async (userContext, setStatus) => {
  try {
    setStatus(prevStatus => [...prevStatus, `Запуск процедуры по кампаниям`]);
    
    let campaigns = []; // Будем хранить результат здесь
    
    try {
      const response = await fetch('/api/CRM/getcompaigns', {
        headers: {
          'Authorization': `Bearer ${userContext.userData.userInfo.token}`
        }
      });
    
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    
      const data = await response.json();
      campaigns = data; // Присваиваем полученные данные
    } catch (error) {
      console.error('Error fetching campaign list:', error);
      throw error;
    }

    setStatus(prevStatus => [...prevStatus, `Данные компаний получены успешно`]);
    return campaigns; // Возвращаем массив кампаний
    
  } catch (error) {
    setStatus(prevStatus => [...prevStatus, 
      `Ошибка при загрузке данных(getCompaigns): ${error.response?.data?.detail || error.message}`
    ]);
    throw error;
  }
};