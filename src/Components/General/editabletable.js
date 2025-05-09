import React, { useState } from 'react';
import styles from '../../CSS/styles.module.css';
import saveandupdate from './saveandupdate';
import TimePicker from 'react-time-picker'; // Импортируем TimePicker

// Компонент для отображения и редактирования данных
function EditableTable({ 
  tablename, 
  tablekey, 
  data, 
  renderInput, 
  rendertimeinput = [], // Добавляем новый необязательный параметр
  rendercheckbox, 
  norender, 
  translations, 
  img 
}) {
    // Инициализируем состояние для хранения и изменения данных
    const [rows, setRows] = useState(
      (data || []).map(row => ({ 
        ...row,
        // Инициализируем все renderInput поля пустой строкой
        ...Object.fromEntries(
          renderInput.map(field => [field, row[field] || ''])
        ),
        // Инициализируем все rendertimeinput поля
        ...Object.fromEntries(
          rendertimeinput.map(field => [field, row[field] || '00:00'])
        )
      })) // <- Здесь закрываем все скобки
    );
    const [errorMessages, seterrors] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [logdata, setlog] = useState([]);
  
    // Обработчик изменения данных в ячейке
    const handleChange = (e, index, field) => {
      const newData = [...rows];
      if (rendercheckbox.includes(field)) {
        newData[index][field] = e.target.checked ? "X" : ""; // Для чекбоксов
      } else {
        newData[index][field] = e.target.value; // Для текстовых полей
      }
      setRows(newData);
    };

    // Обработчик изменения времени
    const handleTimeChange = (time, index, field) => {
      const newData = [...rows];
      newData[index][field] = time || '00:00';
      setRows(newData);
    };
  
    // Объединяем все изменяемые поля для передачи изменений в БД
    const changefields = [...renderInput, ...rendertimeinput, ...rendercheckbox];
    
    // Обработчик сохранения изменений
    const handleSave = async () => {
      const saveresults = await saveandupdate(rows, tablekey, changefields, tablename);
      seterrors(saveresults);
      setlog(rows);
    };

    // Функция для получения перевода заголовка, если он доступен
    const getTranslation = (key) => {
      // Находим объект в массиве translations, где colname равно key
      const translationObj = translations.find(obj => obj.colname === key);
      
      // Возвращаем значение value найденного объекта, если объект найден
      // В противном случае возвращаем исходный ключ
      return translationObj ? translationObj.value : key;
    };

    const requestSort = (key) => {
      let direction = 'ascending';
      if (sortConfig.key === key && sortConfig.direction === 'ascending') {
          direction = 'descending';
      }
      setSortConfig({ key, direction });
      const sortedData = [...rows].sort((a, b) => {
          if (a[key] < b[key]) {
              return direction === 'ascending' ? -1 : 1;
          }
          if (a[key] > b[key]) {
              return direction === 'ascending' ? 1 : -1;
          }
          return 0;
      });
      setRows(sortedData);
    };

    const setAllCheckboxes = (field) => {
      // Проверяем, все ли чекбоксы в столбце уже отмечены
      const allChecked = rows.every(row => row[field] === "X");
      const newValue = allChecked ? "" : "X"; // Если все отмечены, будем очищать, иначе - заполнять
      const newData = rows.map(row => ({
          ...row,
          [field]: newValue
      }));
      setRows(newData);
    };

    return (
      <div>
        <table className={`${styles.comtable}`}>
          <thead>
            <tr>
              {/* Исключаем из заголовков поля, указанные в norender, и используем переводы, если они есть */}
              {Object.keys(rows[0])
                .filter(key => !norender.includes(key))
                .map((key) => (
                  <th className={`${styles.tableheader} ${key}`} key={key} onClick={() => requestSort(key)}>
                  {getTranslation(key)}
                  {rendercheckbox.includes(key) && (
                      <div style={{ display: 'inline-block', marginLeft: '10px' }}>
                          <button onClick={(e) => { e.stopPropagation(); setAllCheckboxes(key); }}>1</button>
                      </div>
                  )}
              </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr className={`${styles.tablerow}`} key={rowIndex}>
                {Object.entries(row)
                  .filter(([field]) => !norender.includes(field))
                  .map(([field, value]) => (
                    <td className={`${styles.tabledata}`} key={field}>
                      {rendercheckbox.includes(field) ? (
                        <input
                          className={`${styles.checkbox}`}
                          type="checkbox"
                          checked={value === "X"}
                          onChange={(e) => handleChange(e, rowIndex, field)}
                        />
                      ) : renderInput.includes(field) ? (
                        <input
                          className={`${styles.tableinput}`}
                          type="text"
                          value={value}
                          onChange={(e) => handleChange(e, rowIndex, field)}
                        />
                      ) : rendertimeinput.includes(field) ? (

                          <input aria-label="Time" type="time"
                          className={`${styles.timepicker}`}
                          onChange={(time) => handleTimeChange(time, rowIndex, field)}
/*                           
                          value={value}
                          format="HH:mm"
                          disableClock={true}
                          clearIcon={null} */
                          />
                      ) : img.includes(field) ? (
                        <div className={`${styles.tablephoto}`}>
                          <img
                          className={`${styles.smallimg}`}
                            src={value}
                            alt={''}
                          />
                        </div>
                      ) :  (
                        <span className={`${styles.tablespan}`}>{value}</span>
                      )}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={handleSave}>Сохранить</button>            
        <div>
          {errorMessages.map((message, index) => (
            <p key={index}>{message}</p>
          ))}
        </div>
      </div>
    );
  }
  
  export default EditableTable;