import React, { useState, useEffect, useContext } from "react";
import styles from "../../CSS/styles.module.css";
import {
  gettablefrombd,
  gettablelocale,
} from "../General/Frombackend/frombackend";
import "../../CSS/App.css";
import EditableTable from "../General/editabletable";
import { gettableKeys } from "../General/tableactions";
import { UserContext } from "../Context/context";
import { uploadGoodsData } from "../Upload/dataUploadFunctions";

// Функция для обработки данных
async function getadddatagoods(finalData, setStatus) {
  setStatus((prevStatus) => [
    ...prevStatus,
    `Начало обработки данных из таблицы photos`,
  ]);
  // Получение данных из таблицы photo
  const photoDataFromDB = await gettablefrombd("photos");
  setStatus((prevStatus) => [
    ...prevStatus,
    `Данные из таблицы photos успешно получены`,
  ]);
  // Преобразование photoDataFromDB в объект для более быстрого доступа к данным по nmid
  const photoDataMap = photoDataFromDB.reduce((acc, item) => {
    acc[item.nmid] = item.big;
    return acc;
  }, {});

  // Обработка исходного массива finalData и добавление в него данных из allDataFromDB и photoDataFromDB
  const resultData = finalData.map((item) => {
    const { nmid, ...rest } = item; // Используем деструктуризацию для получения nmid и остальных свойств
    const photo = photoDataMap[nmid];

    if (photo) {
      return {
        big: photo,
        nmid: item.nmid,
        ...rest, // Добавляем остальные свойства объекта после big
      };
    } else {
      return item;
    }
  });
  return resultData;
}

function Goodsmain() {
  const [status, setStatus] = useState([]);
  const [goodsdata, setGdata] = useState(null);
  const renderInputFields = ["sprice"];
  const [translations, settrans] = useState([]);
  const userdata = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true); // Добавленное состояние для отслеживания загрузки
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true); // Начало загрузки
      setStatus([]);

      await uploadGoodsData(userdata, setStatus); //Обновление данных с портала ВБ и запись в БД
      setStatus((prevStatus) => [...prevStatus, `Перерыв между функциями`]);
      await fetchData(); //получение данных из БД и обработка перед выводом на экран
      setIsLoading(false); // Завершение загрузки
    };
    initializeData();
  }, []); // Пустой массив зависимостей гарантирует выполнение эффекта только при монтировании компонента

  const fetchData = async () => {
    setStatus((prevStatus) => [
      ...prevStatus,
      `Начало загрузки данных из базы данных`,
    ]);
    setGdata(null);
    settrans([]);
    try {
      const finaldata = await gettablefrombd("goods");
      setStatus((prevStatus) => [
        ...prevStatus,
        `Данные из таблицы goods успешно получены`,
      ]);

      // Удаляем записи, у которых deleted = true
      const filteredData = finaldata.filter((item) => item.deleted !== "X");
      setStatus((prevStatus) => [
        ...prevStatus,
        `Удалены записи с deleted = true`,
      ]);

      let resultData = [];

      if (filteredData) {
        // Сортировка массива finaldata по vendorcode
        filteredData.sort((a, b) => {
          if (a.vendorcode < b.vendorcode) {
            return -1;
          }
          if (a.vendorcode > b.vendorcode) {
            return 1;
          }
          return 0; // Если vendor_code равны, порядок оставляем без изменений
        });
        setStatus((prevStatus) => [
          ...prevStatus,
          `Данные из таблицы goods отсортированы по vendorcode`,
        ]);
        resultData = await getadddatagoods(filteredData, setStatus);
        setGdata(resultData);
        setStatus((prevStatus) => [
          ...prevStatus,
          `Данные товаров успешно обработаны и установлены в состояние`,
        ]);
      } else {
        throw new Error("Ошибка считывания цен из базы данных");
      }

      const tablekeys = gettableKeys(resultData);
      setStatus((prevStatus) => [
        ...prevStatus,
        `Ключи таблицы успешно получены`,
      ]);
      const translations = await gettablelocale(tablekeys, userdata.locale);
      setStatus((prevStatus) => [
        ...prevStatus,
        `Переводы для таблицы успешно загружены`,
      ]);
      settrans(translations);
    } catch (error) {
      setStatus((prevStatus) => [
        ...prevStatus,
        `Ошибка при загрузке данных(fetchdata): ${error.message}`,
      ]);
      setGdata(null);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.pagecontainer}>
        <div className={styles.vidget}>
          <p>Загрузка данных......</p>
        </div>
      </div>
    ); // Или любой другой индикатор загрузки
  }

  return (
    <div className={styles.vidget}>
{/* Блок вывода ошибок ниже.( раскомментить для вывода на экран) */}
      <div>
        {status.map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      {goodsdata && (
        <EditableTable
          tablename={"goods"}
          tablekey={"nmid"}
          data={goodsdata}
          renderInput={renderInputFields}
          rendercheckbox={["deleted"]}
          norender={["imtid", "subjectid"]}
          translations={translations}
          img={"big"}
        />
      )}
    </div>
  );
}

export default Goodsmain;
