import { getTableFromDB } from './tableservice'

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
    
      const data = await response.json(); // Присваиваем значение
      goodsData = data;
    } catch (error) {
      console.error('Error fetching goods data:', error);
      throw error; // Пробрасываем ошибку дальше
    }
    return setStatus, goodsData;
  } catch (error) {
    setStatus(prevStatus => [...prevStatus, 
      `Ошибка при загрузке данных(uploadGoodsData): ${error.response?.data?.detail || error.message}`
    ]);
    throw error; // Пробрасываем ошибку для обработки выше
  }
  
  
};

export async function enrichWithGoodsData(finalData) {
    const allDataFromDB = await getTableFromDB('goods');
    const photoDataFromDB = await getTableFromDB('photos');

    const photoDataMap = photoDataFromDB.reduce((acc, item) => {
        acc[item.nmid] = item.big;
        return acc;
    }, {});

    const allDataMap = allDataFromDB.reduce((acc, item) => {
        acc[item.nmid] = item;
        return acc;
    }, {});

    return finalData.map(item => {
        const { nmid } = item;
        const photo = photoDataMap[nmid];
        const additionalData = allDataMap[nmid];

        if (additionalData && photo) {
            return {
                big: photo,
                nmid: nmid,
                vendorcode: additionalData.vendorcode,
                title: additionalData.title,
                price: item.price,
                discount: item.discount,
                promocode: item.promocode,
                currentprice: item.currentprice,
                dayprice: item.dayprice,
                daydisc: item.daydisc,
                nightprice: item.nightprice,
                nightdisc: item.nightdisc,
                active: item.active
            };
        }
        return item;
    });
}