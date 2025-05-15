import React, { useState, useEffect, useContext } from "react";
import styles from "../../CSS/styles.module.css";
import "../../CSS/App.css";
import EditableTable from "../General/editabletable";
import { UserContext } from "../Context/context";
import { downloadGoodsData } from "../Upload/dataUploadFunctions";

const Goodsmain = () => {
  const [status, setStatus] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userdata = useContext(UserContext);
    // Конфигурация для EditableTable
  const tableConfig = {
    tablename: 'goods', // Имя таблицы БД
    tablekey: 'nmid', // ключ
    renderInput: ['sprice'], // Какие поля можно редактировать
    rendercheckbox: ['deleted'], // Чекбоксы
    rendertimeinput: [],
    norender: ['imtid', 'subjectid'], // Скрытые поля
    translations: [], // Переводы заголовков
    img: ['big'], // Поля с изображениями
    nosendfields: ['big'], 
    converttoint: ['sprice'] 
  };

  const fetchGoods = async () => {
  try {
    const goods = await downloadGoodsData(userdata, setStatus);
    setTableData(goods);
  } catch (err) {
    setError(err.message);
    console.error('Ошибка при загрузке данных:', err);
  } finally {
    setLoading(false);
  }
  };


  useEffect(() => {
    fetchGoods();
  }, []);

  if (loading) return <div>Загрузка данных...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
  <div className={styles.vidget}>
    <div>
      {status.map((line, index) => (
        <p key={index}>{line}</p>
      ))}
    </div>
    <h2>Данные по карточкам товаров</h2>
      <EditableTable
      {...tableConfig} 
      data={tableData} 
      />
    </div>
  );
}
export default Goodsmain;
