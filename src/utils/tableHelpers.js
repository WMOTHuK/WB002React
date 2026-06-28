// tablehelpers.js

import { getTableLocale } from '../services/api/tableService';

export function getTableKeys(dataArray) {
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

  /**
 * Translate values in a specific field of data rows.
 * @param {Array} rows - data rows
 * @param {string} fieldKey - field to translate (e.g., 'field')
 * @param {string} locale - user locale
 * @param {string} token - auth token
 * @returns {Array} rows with translated field
 */
export async function translateFieldValues(rows, fieldKey, locale, token) {
  if (rows.length === 0) return rows;

  const { getTableLocale } = await import('../services/api/tableService');
  
  const values = [...new Set(rows.map(r => r[fieldKey]))];
  const translations = await getTableLocale(values, locale, token);

  const map = {};
  if (Array.isArray(translations)) {
    translations.forEach(t => {
      map[t.colname] = t.value;
    });
  }

  return rows.map(r => ({
    ...r,
    [fieldKey]: map[r[fieldKey]] || r[fieldKey],
  }));
}