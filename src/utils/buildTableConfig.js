// src/utils/buildTableConfig.js

import { columnTypes, editableFields, excludedFields } from '../config/columnPresets';

/**
 * Resolve the type of a field by its accessorKey.
 * Defaults to 'text' if not found in columnTypes.
 */
function getFieldType(key) {
  for (const [type, fields] of Object.entries(columnTypes)) {
    if (fields.includes(key)) return type;
  }
  return 'text';
}

/**
 * Build a columns array for DataTable.
 *
 * @param {string[]}   keys         – field names extracted from data
 * @param {object[]}   translations – [{ colname, value }] for header labels
 * @param {string}     mode         – 'view' or 'edit'
 * @param {function}   navigate     – react-router navigate (for link columns)
 * @param {function}   onChange     – callback(field, value, row) for editable cells
 * @returns {object[]} columns compatible with DataTable
 */
export function buildTableConfig({ keys, translations = [], mode = 'view', navigate, onChange }) {
    const translationMap = {};
    if (Array.isArray(translations)) {
    translations.forEach(t => {
        translationMap[t.colname] = t.value;
    });
    }

  return keys
    .filter(key => !excludedFields.includes(key))  // ← фильтруем скрытые
    .map(key => {
      const type = getFieldType(key);
      const column = {
        accessorKey: key,
        header: translationMap[key] || key,
        type,
      };

    // Make editable in 'edit' mode
    if (mode === 'edit' && editableFields.includes(key)) {
      column.editable = true;
      column.onChange = (value, row) => {
        if (onChange) onChange(key, value, row);
      };
    }

    // Link columns – navigate on click
    if (type === 'link') {
    column.onLinkClick = (row) => {
        const section = key === 'advertid' ? 'adverts' : 'goods';
        if (navigate) {
        navigate(`/${section}/${row[key]}`);
        }
    };
    }
    return column;
  });
}