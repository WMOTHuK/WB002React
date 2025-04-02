// dataUploadFunctions.js
import axios from 'axios';
import fetchgoods from '../General/FromWildberries/fetchgoods';
import saveandupdate from '../General/saveandupdate';
import { gettableKeys } from '../General/tableactions';
import apikeys from '../Private/userdata';


const content_url = 'https://content-api.wildberries.ru/content/v2/get/cards/list';
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
export const uploadGoodsData = async (userContext, setStatus) => {
  try {

    setStatus(prevStatus => [...prevStatus,`Запуск процедуры по товарам`]);
    const wbData = await fetchgoods(content_url, userContext.apikeycontent);
    const { singleFields: goods, photos } = processCards(wbData.cards);
    setStatus(prevStatus => [...prevStatus, `Данные из Вайлдберриз получены успешно(Товары)`]);
    await saveandupdate(goods, 'nmid', gettableKeys(goods), 'goods');
    await saveandupdate(photos, 'nmid', gettableKeys(photos), 'photos');
    setStatus(prevStatus => [...prevStatus, `Данные из Вайлдберриз обновлены(Товары)`]);
  } catch (error) {
    setStatus(prevStatus => [...prevStatus, `Ошибка при загрузке данных(uploadGoodsData): ${error.response.data.detail}`]);
  }
  return setStatus;
};