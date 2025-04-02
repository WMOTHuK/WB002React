import React, { useState, useEffect, useContext } from 'react';
import styles from '../../CSS/styles.module.css';
import sendDataToBackend from '../General/Tobackend/tobackend';
import { gettablefrombd, gettablelocale } from '../General/Frombackend/frombackend';
import '../../CSS/App.css';
import { fetchWBdata } from '../General/FromWildberries/fromwildberries';
import EditableTable from '../General/editabletable';
import { gettableKeys } from '../General/tableactions';
import { uploadGoodsData } from '../Upload/dataUploadFunctions';
import { UserContext } from '../Context/context';

// Функция для обработки данных
async function getadddata(finalData) {
  // Получение данных из таблицы goods
  const allDataFromDB = await gettablefrombd('goods');
  // Получение данных из таблицы photo
  const photoDataFromDB = await gettablefrombd('photos');
  debugger;
  // Преобразование photoDataFromDB в объект для более быстрого доступа к данным по nmid
  const photoDataMap = photoDataFromDB.reduce((acc, item) => {
      acc[item.nmid] = item.big;
      return acc;
  }, {});

  // Преобразование allDataFromDB в объект для более быстрого доступа к данным по nmid
  const allDataMap = allDataFromDB.reduce((acc, item) => {
      acc[item.nmid] = item;
      return acc;
  }, {});

  // Обработка исходного массива finalData и добавление в него данных из allDataFromDB и photoDataFromDB
  const resultData = finalData.map(item => {
      const { nmid } = item;
      const photo = photoDataMap[nmid];
      const additionalData = allDataMap[nmid];

      // Если для текущего nmid есть соответствующие данные в allDataMap и photoDataMap, добавляем их к объекту
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
      } else {
          // Если нет соответствия, возвращаем исходный элемент без изменений (или с некоторыми модификациями, если это необходимо)
          return item;
      }
  });
  return resultData;
}



function Changeprice() {
  const [status, setStatus] = useState([]); 
  const [pricedata, setPdata] = useState(null);
  const renderInputFields = ['dayprice', 'daydisc', 'nightprice', 'nightdisc'];
  const rendercheckboxfields = ['active'];
  const [translations, settrans] = useState([]);
  const userdata = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true); // Добавленное состояние для отслеживания загрузки
  useEffect(() => {
    setStatus(prevStatus => [...prevStatus, `Начало функции инициализации`]);
    const initializeData = async () => {
      setStatus(prevStatus => [...prevStatus, `Начало функции инициализации`]);
      setIsLoading(true); // Начало загрузки
      setStatus([]);
      
      await uploadGoodsData(userdata, setStatus);
      setStatus(prevStatus => [...prevStatus, `Перерыв между функциями`]);
      await fetchData();
      setIsLoading(false); // Завершение загрузки
    };
    initializeData();
  }, []); // Пустой массив зависимостей гарантирует выполнение эффекта только при монтировании компонента


  const fetchData = async () => {
    
    setPdata(null);
    settrans([]);
    setStatus(prevStatus => [...prevStatus, `запуск процедуры по ценам`]);
    try {
      const url = 'https://discounts-prices-api.wb.ru/api/v2/list/goods/filter?limit=1000&offset=0';
      const wbData = await fetchWBdata(url, userdata.apikeyprice);
      setStatus(prevStatus => [...prevStatus, `Данные из Вайлдберриз получены успешно(Цены)`]);
      debugger;
      const results = await sendDataToBackend('/api/save-data/prices', wbData);
      if (results) {
        setStatus(prevStatus => [...prevStatus, `Произведено обновление БД(Цены)`]);
      } else {
        throw new Error('Ошибка обновления цен в базе данных');
      }

      const finaldata = await gettablefrombd('prices');
      let resultData = []; 

      if (finaldata) {
          // Сортировка массива finaldata по vendor_code
          finaldata.sort((a, b) => {
            if (a.vendorcode < b.vendorcode) {
              return -1;
            }
            if (a.vendorcode > b.vendorcode) {
              return 1;
            }
            return 0; // Если vendor_code равны, порядок оставляем без изменений
          });

        setStatus(prevStatus => [...prevStatus, `Данные загружены из БД(Цены)`]);
        resultData = await getadddata(finaldata);
        setPdata(resultData);
        
      } else {
        throw new Error('Ошибка считывания цен из базы данных');
      }
 
      const tablekeys = gettableKeys(resultData);
      const translations = await gettablelocale(tablekeys, userdata.locale);
      settrans(translations);
    } catch (error) {
      setStatus(prevStatus => [...prevStatus, `Ошибка при загрузке данных: ${error.message}`]);
      setPdata(null);
      setIsLoading(false); 
    }
  };

  if (isLoading) {
    return <div className={styles.pagecontainer}>
    <div className={styles.vidget}>
      <p>Загрузка данных......</p>
    </div>
  </div>; // Или любой другой индикатор загрузки
  }

  return (
    <div className={styles.vidget}>
{/*       <div>
        {status.map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div> */}
      {pricedata && (
        <EditableTable
          tablename={'prices'}
          tablekey={'nmid'}
          data={pricedata}
          renderInput={renderInputFields}
          rendercheckbox={rendercheckboxfields}
          norender={['promocode', 'dayprice', 'nightprice']}
          translations={translations}
          img={'big'}
        />
      )}
    </div>
  );
}

export default Changeprice;