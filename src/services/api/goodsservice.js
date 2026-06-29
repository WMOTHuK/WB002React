import axios from 'axios';

const CONTENT_API = '/api/content';

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


export async function fetchGoodsTypes(locale, token) {
  const response = await axios.get(`${CONTENT_API}/getgoodstypes`, {
    params: { locale },
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function addGoodsType({ name, description, locale }, token) {
  const response = await axios.post(`${CONTENT_API}/addgoodstype`, {
    name,
    description,
    locale
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function fetchGoodsGroups(locale, token) {
  const response = await axios.get(`${CONTENT_API}/getgoodsgroups`, {
    params: { locale },
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function addGoodsGroup({ name, description, goods_type_id, locale }, token) {
  const response = await axios.post(`${CONTENT_API}/addgoodsgroup`, {
    name,
    description,
    goods_type_id,
    locale
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function changeGoodsGroupType({ id, goods_type_id }, token) {
  const response = await axios.post(`${CONTENT_API}/changegoodsgrouptype`, {
    id,
    goods_type_id
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

/**
 * Update cost and date for a good.
 */
export async function updateCostPrice({ vendorcode, platform, new_cost, start_date }, token) {
  const response = await axios.post('/api/content/update_cost_price', {
    vendorcode,
    platform,
    new_cost,
    start_date,
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

/**
 * Change group for a good.
 */
export async function changeGoodsGroup({ vendorcode, goods_grp_id }, token) {
  const response = await axios.post('/api/content/changegoodsgroup', {
    vendorcode,
    goods_grp_id,
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

/**
 * Save a good row — detects changed fields and calls appropriate API.
 * Returns { success, error? }.
 */
export async function saveGoodsRow(row, originalRow, token) {
  const trackedFields = ['wb_current_cost', 'ozon_current_cost', 'goods_grp_sel'];
  
  const changedFields = [];
  for (const key of trackedFields) {
    if (String(row[key] ?? '') !== String(originalRow?.[key] ?? '')) {
      changedFields.push(key);
    }
  }

  if (changedFields.length === 0) return { success: true };

  const errors = [];

  // Если изменилась себестоимость WB
  if (changedFields.includes('wb_current_cost')) {
    try {
      await updateCostPrice({
        vendorcode: row.vendorcode,
        new_cost: row.wb_current_cost,
        start_date: row.change_date || new Date().toISOString().slice(0, 10),
        platform: 'wb',
      }, token);
    } catch (err) {
      errors.push(`Ошибка обновления себестоимости WB: ${err.response?.data?.error || err.message}`);
    }
  }

  // Если изменилась себестоимость OZON
  if (changedFields.includes('ozon_current_cost')) {
    try {
      await updateCostPrice({
        vendorcode: row.vendorcode,
        new_cost: row.ozon_current_cost,
        start_date: row.change_date || new Date().toISOString().slice(0, 10),
        platform: 'ozon',
      }, token);
    } catch (err) {
      errors.push(`Ошибка обновления себестоимости OZON: ${err.response?.data?.error || err.message}`);
    }
  }

  // Если изменилась группа
  if (changedFields.includes('goods_grp_sel')) {
    try {
      await changeGoodsGroup({
        vendorcode: row.vendorcode,
        goods_grp_id: row.goods_grp_sel || null,
      }, token);
    } catch (err) {
      errors.push(`Ошибка смены группы: ${err.response?.data?.error || err.message}`);
    }
  }

  if (errors.length > 0) {
    return { success: false, error: errors.join('; ') };
  }

  return { success: true };
}

export async function syncUserGoods(token) {
  const response = await axios.post(`${CONTENT_API}/syncusergoods`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}