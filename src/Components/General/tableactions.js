export function gettableKeys(dataArray) {
    // Проверяем, не пустой ли массив
    if (!dataArray || dataArray.length === 0) {
      return [];
    }
  
    // Создаем множество для хранения уникальных ключей
    const keysSet = new Set();
  
    // Проходим по каждому объекту в массиве
    dataArray.forEach(item => {
      // Добавляем ключи текущего объекта в множество
      Object.keys(item).forEach(key => {
        keysSet.add(key);
      });
    });
  
    // Преобразуем множество в массив и возвращаем его
    return Array.from(keysSet);
  }