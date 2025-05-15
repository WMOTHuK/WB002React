// Upload/dataUploadFunctions.js
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

export const getCompaigns = async (userContext, setStatus) => {
  try {
    setStatus(prevStatus => [...prevStatus, `Запуск процедуры по кампаниям`]);
    
    const response = await fetch('/api/CRM/getcompaigns', {
      headers: {
        'Authorization': `Bearer ${userContext.userData.userInfo.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const campaigns = await response.json();
    setStatus(prevStatus => [...prevStatus, `Данные компаний получены успешно`]);
    return campaigns;
    
  } catch (error) {
    setStatus(prevStatus => [...prevStatus, 
      `Ошибка при загрузке данных(getCompaigns): ${error.response?.data?.detail || error.message}`
    ]);
    throw error;
  }
};