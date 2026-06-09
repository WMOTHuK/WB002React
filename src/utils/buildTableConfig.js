// src/utils/buildTableConfig.js

import { columnTypes, editableFields, excludedFields, linkUrls, columnOrder, inputStyles, cellStyles } from '../config/columnPresets';

function getFieldType(key) {
  for (const [type, fields] of Object.entries(columnTypes)) {
    if (fields.includes(key)) return type;
  }
  return 'text';
}

function sortKeys(keys) {
  return [...keys].sort((a, b) => {
    const indexA = columnOrder.indexOf(a);
    const indexB = columnOrder.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return 0;
  });
}

export function buildTableConfig({ keys, translations = [], mode = 'view', navigate, onChange, columnOverrides = {} }) {
  const translationMap = {};
  if (Array.isArray(translations)) {
    translations.forEach(t => {
      translationMap[t.colname] = t.value;
    });
  }

  return sortKeys(keys.filter(key => !excludedFields.includes(key)))
    .map(key => {
      const type = getFieldType(key);
      const column = {
        accessorKey: key,
        header: translationMap[key] || key,
        type,
      };

      // Применяем переопределения из columnOverrides
      if (columnOverrides[key]) {
        const overrides = { ...columnOverrides[key] };
        delete overrides.header;  // не перезаписываем header из переводов
        Object.assign(column, overrides);
      }
      // Select type
      if (column.type === 'select') {
        column.options = column.options || [];
        column.placeholder = column.placeholder || 'Выберите...';
        column.editable = true;
      }

      // Editable fields
      if (mode === 'edit' && editableFields.includes(key)) {
        column.editable = true;
        if (inputStyles[key]) {
          column.inputStyle = inputStyles[key];
          if (inputStyles[key] === 'textarea') {
            column.type = 'textarea';
          }
        }
        if (!column.onChange) {
          column.onChange = (value, row) => {
            if (onChange) onChange(key, value, row);
          };
        }
      }

      // Link columns
      if (column.type === 'link') {
        const urlBuilder = linkUrls[key];
        column.onLinkClick = (row) => {
          if (!urlBuilder) return;
          const url = urlBuilder(row);
          if (url.startsWith('http')) {
            window.open(url, '_blank');
          } else if (navigate) {
            navigate(url);
          }
        };
      }

      // Cell styles
      if (cellStyles && cellStyles[key]) {
        column.cellStyle = cellStyles[key];
      }

      return column;
    });
}