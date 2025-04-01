import React, { useState } from 'react';

// Заглушки для функций, которые будут реализованы позже
const processrows = (rows) => console.log('Processing rows:', rows);
const saverowsbd = (rows) => console.log('Saving rows to DB:', rows);
const updateoutput = () => console.log('Updating output...');

const InsertionTable = ({ insdata, nrows }) => {
  // Состояние для хранения данных из полей ввода
  const [rows, setRows] = useState(Array(nrows).fill(null).map(() => (
    insdata.reduce((acc, { fname }) => ({ ...acc, [fname]: '' }), {})
  )));

  // Обработчик изменения в полях ввода
  const handleInputChange = (rowIndex, fname, value) => {
    const newRows = rows.map((row, idx) => (
      idx === rowIndex ? { ...row, [fname]: value } : row
    ));
    setRows(newRows);
  };

  // Обработчик нажатия на кнопку "Сохранить"
  const handleSave = () => {
    processrows(rows); // Обработка данных
    saverowsbd(rows); // Сохранение данных в БД
    updateoutput(); // Постобработка (например, обновление таблицы)
  };

  // Генерация полей ввода в зависимости от типа
// Генерация полей ввода в зависимости от типа
const renderInputField = (ftype, rowIndex, fname, value) => {
    switch (ftype) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(rowIndex, fname, e.target.value)}
          />
        );
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleInputChange(rowIndex, fname, e.target.value)}
          />
        );
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(rowIndex, fname, e.target.value)}
          >
            {/* Предполагаем, что первое значение — пустое, чтобы пользователь сделал явный выбор */}
            <option value="">Выберите...</option>
            {insdata.find(data => data.fname === fname).fvalues.map(optionValue => (
              <option key={optionValue} value={optionValue}>
                {optionValue}
              </option>
            ))}
          </select>
        );
      // Добавьте больше случаев для других типов данных
      default:
        return null;
    }
  };

  return (
    <div>
      <table>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {insdata.map(({ fname, ftype }) => (
                <td key={fname}>
                  {renderInputField(ftype, rowIndex, fname, row[fname])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleSave}>Сохранить</button>
    </div>
  );
};

export default InsertionTable;