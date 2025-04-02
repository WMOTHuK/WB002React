import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EditableTable from './EditableTable'; // Путь к вашему компоненту

const CRM_Headers = ({ apiKey, param1, param2 /* другие параметры */ }) => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Конфигурация для EditableTable
  const tableConfig = {
    tablename: 'CRM_HEADER',
    tablekey: 'id', // Укажите поле, которое является уникальным ключом
    renderInput: [], // Какие поля можно редактировать
    rendercheckbox: [], // Чекбоксы
    norender: [], // Скрытые поля
    translations: [], // Переводы заголовков
    img: [] // Поля с изображениями
  };

  const fetchCRM_headers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://advert-api.wb.ru/adv/v1/promotion/count', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          // Здесь будут параметры, которые вы укажете позже
          param1,
          param2
          // ...
        }
      });

      // Трансформация данных под формат EditableTable
      const transformedData = response.data.map(item => ({
        ...item,
        // Дополнительные преобразования при необходимости
      }));

      setTableData(transformedData);
    } catch (err) {
      setError(err.message);
      console.error('Ошибка при загрузке данных:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCRM_headers();
  }, [apiKey, param1, param2]); // Зависимости для повторного запроса

  if (loading) return <div>Загрузка данных...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div>
      <h2>Данные по количеству акций</h2>
      <EditableTable 
        {...tableConfig} 
        data={tableData} 
      />
      <button onClick={fetchPromotionCount}>Обновить данные</button>
    </div>
  );
};

export default CRM_Headers;