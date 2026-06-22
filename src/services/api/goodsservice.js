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
export async function updateCostPrice({ vendorcode, new_cost, start_date }, token) {
  const response = await axios.post('/api/content/update_cost_price', {
    vendorcode,
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
  // Сравниваем только редактируемые поля
  const editableKeys = ['current_cost', 'goods_grp_sel',];
  
  const changedFields = [];
  for (const key of editableKeys) {
    const newVal = row[key];
    const oldVal = originalRow?.[key];
    
    // Приводим к строке для надёжного сравнения
    if (String(newVal ?? '') !== String(oldVal ?? '')) {
      changedFields.push(key);
    }
  }

  if (changedFields.length === 0) return { success: true };

  // Правила сохранения
  const saveRules = [
    {
      fields: ['current_cost'],
      fn: () => updateCostPrice({
        vendorcode: row.vendorcode,
        new_cost: row.current_cost,
        start_date: row.change_date,
      }, token),
    },
    {
      fields: ['goods_grp_sel'],
      fn: () => changeGoodsGroup({
        vendorcode: row.vendorcode,
        goods_grp_id: row.goods_grp_sel || null,
      }, token),
    },
  ];

  // Ищем точное совпадение
  const matchedRule = saveRules.find(rule =>
    rule.fields.length === changedFields.length &&
    rule.fields.every(f => changedFields.includes(f))
  );

  if (!matchedRule) {
    return {
      success: false,
      error: `Нет функции обновления для полей: ${changedFields.join(', ')}`,
    };
  }

  try {
    await matchedRule.fn();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.error || err.message,
    };
  }
}

export async function syncUserGoods(token) {
  const response = await axios.post(`${CONTENT_API}/syncusergoods`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}