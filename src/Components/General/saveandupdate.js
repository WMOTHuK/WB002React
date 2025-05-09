/* import { gettablefrombd } from './Frombackend/frombackend';
import updaterow from './Tobackend/updaterow';
import insertrow from './Tobackend/insertrow'; // Предполагаем, что функция импортирована


async function saveAndUpdate(rows, tablekey, renderInput, tablename) {
  const updateresult = [];
  // Считываем все данные из таблицы один раз
  const allDataFromDB = await gettablefrombd(tablename);
  

  let dataByNmid = {};
  if (allDataFromDB.length > 0) {
    // Преобразуем полученные данные в объект для быстрого доступа по nmid, если массив не пуст
    dataByNmid = allDataFromDB.reduce((acc, item) => {
      acc[item.nmid] = item;
      return acc;
    }, {});
  }

  for (const row of rows) {
    const dbRow = dataByNmid[row.nmid];

    if (!dbRow) {
      // Если dbRow не выбрана, вставляем новую запись
      const insertStatus = await insertrow(tablename, row);
      updateresult.push(`Insert status for ${row[tablekey]}: ${insertStatus}`);
      continue;
    }
    // Проверка на различие интересующих нас полей, если dbRow выбрана
    let isDifferent = renderInput.some(field => dbRow[field] !== row[field]);

    if (isDifferent) {
      // Если есть различия, обновляем строку в базе данных
      const updateStatus = await updaterow(tablename, tablekey, renderInput, row);    
      updateresult.push(`Update status for ${row[tablekey]}: ${updateStatus}`);
    } else {
      updateresult.push(`No changes for ${row[tablekey]}`);
    }
  }

  return updateresult;
}

export default saveAndUpdate; */