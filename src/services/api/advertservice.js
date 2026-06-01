//dataUploadFunctions.js


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