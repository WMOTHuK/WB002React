import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from "../Context/context";
import EditableTable from "../General/editabletable.js";
import { getCompaigns } from '../Upload/dataUploadFunctions.js';


const CRM_Headers = ({ apiKey, param1, param2 /* другие параметры */ }) => {
  const [status, setStatus] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userdata = useContext(UserContext);

  // Конфигурация для EditableTable
  const tableConfig = {
    tablename: 'crm_headers',
    tablekey: 'advertid', // Укажите поле, которое является уникальным ключом
    renderInput: [], // Какие поля можно редактировать
    rendercheckbox: [], // Чекбоксы
    norender: [], // Скрытые поля
    translations: [], // Переводы заголовков
    img: [] // Поля с изображениями
  };

  const fetchCRM_headers = async () => {
    try {
      const campaigns = await getCompaigns(userdata, setStatus);
      setTableData(campaigns.data);
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

    </div>
  );
};

export default CRM_Headers;