//src/Components/General/editabletable.js
import React, { useState, useContext } from 'react';
import styles from '../../CSS/styles.module.css';
import axios from 'axios';
import { UserContext } from "../Context/context";

// Компонент для отображения и редактирования данных
function EditableTable({ 
  tablename, 
  tablekey, 
  data, 
  renderInput = [], 
  rendertimeinput = [], 
  rendercheckbox = [], 
  norender = [], 
  translations = [], 
  img = [],
  nosendfields = [], 
  converttoint = [] 
}) {
    const [rows, setRows] = useState(
      (data || []).map(row => ({ 
        ...row,
        ...Object.fromEntries(
          renderInput.map(field => [field, row[field] ?? ''])
        ),
        ...Object.fromEntries(
          rendertimeinput.map(field => [field, row[field] ?? '00:00'])
        ),
        ...Object.fromEntries(
          rendercheckbox.map(field => [field, row[field] === true || row[field] === "X"])
        )
      }))
    );
    
    const [errorMessages, seterrors] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [logdata, setlog] = useState([]);
    const context = useContext(UserContext);
    const token = context.userData.userInfo.token;
    
    // Проверка ввода для числовых полей
    const validateNumberInput = (value, field) => {
      if (converttoint.includes(field)) {
        return value === '' || /^\d+$/.test(value);
      }
      return true;
    };

    const handleChange = (e, index, field) => {
      const value = e.target.value;
      
      // Проверяем ввод для числовых полей
      if (renderInput.includes(field) && converttoint.includes(field)) {
        if (!validateNumberInput(value, field)) {
          return; // Не обновляем состояние при невалидном вводе
        }
      }

      const newData = [...rows];
      if (rendercheckbox.includes(field)) {
        newData[index][field] = e.target.checked;
      } else {
        newData[index][field] = value;
      }
      setRows(newData);
    };

    const handleTimeChange = (event, index, field) => {
      const timeValue = event?.target?.value || '00:00';
      setRows(prevRows => {
        const newRows = [...prevRows];
        newRows[index] = {
          ...newRows[index],
          [field]: timeValue
        };
        return newRows;
      });
    };
    
    const changefields = [...renderInput, ...rendertimeinput, ...rendercheckbox];
    
    const handleSave = async () => {
      try {
        if (!token) {
          throw new Error('Требуется авторизация');
        }
    
        const cleanRows = rows.map(row => {
          const cleanRow = {};
          
          Object.keys(row).forEach(key => {
            // Пропускаем исключенные поля
            if (key.endsWith('_desc') || nosendfields.includes(key) || key === 'big') {
              return;
            }

            // Преобразуем числовые поля
            if (converttoint.includes(key)) {
              cleanRow[key] = row[key] ? parseInt(row[key], 10) : null;
            } 
            // Обрабатываем time-поля
            else if (rendertimeinput.includes(key)) {
              cleanRow[key] = typeof row[key] === 'string' ? row[key] : '00:00';
            } 
            // Все остальные поля
            else {
              cleanRow[key] = row[key];
            }
          });
          
          return cleanRow;
        });
    
        const response = await axios.post('/api/DB/updatetable', {
          rows: cleanRows,
          tableName: tablename,
          keyFields: tablekey
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
    
        if (response.data.success) {
          seterrors(response.data.result.errors);
          setlog([`Успешно: ${response.data.message}`]);
        } else {
          seterrors([`Ошибка сервера: ${response.data.error}`]);
        }
      } catch (error) {
        let errorMessage = 'Неизвестная ошибка';
        if (error.response) {
          errorMessage = error.response.data?.error || error.response.statusText;
        } else if (error.request) {
          errorMessage = 'Нет ответа от сервера';
        } else {
          errorMessage = error.message;
        }
        seterrors([`Ошибка сохранения: ${errorMessage}`]);
        console.error('Полная ошибка:', error);
      }
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
      const allChecked = rows.every(row => row[field] === true);
      const newValue = !allChecked; // Инвертируем текущее состояние
      
      setRows(prevRows => 
        prevRows.map(row => ({
          ...row,
          [field]: newValue
        }))
      );
    };


    return (
      <div>
        <table className={`${styles.comtable}`}>
          <thead>
            <tr>
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
                          checked={!!value}
                          onChange={(e) => handleChange(e, rowIndex, field)}
                        />
                      ) : renderInput.includes(field) ? (
                        <input
                          className={`${styles.tableinput}`}
                          type={converttoint.includes(field) ? "number" : "text"}
                          value={value}
                          onChange={(e) => handleChange(e, rowIndex, field)}
                        />
                      ) : rendertimeinput.includes(field) ? (
                        <input 
                          aria-label="Time" 
                          type="time"
                          className={`${styles.timepicker}`}
                          onChange={(e) => handleTimeChange(e, rowIndex, field)}
                          value={rows[rowIndex][field] || '00:00'}
                        />
                      ) : img.includes(field) ? (
                        <div className={`${styles.tablephoto}`}>
                          <img
                            className={`${styles.smallimg}`}
                            src={value}
                            alt={''}
                          />
                        </div>
                      ) : (
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
        <div>
          {logdata.map((message, index) => (
            <p key={index}>{message}</p>
          ))}
        </div>
      </div>
    );
}
  
  export default EditableTable;