
import { columnTypes, editableFields, excludedFields, linkUrls, columnOrder } from '../config/columnPresets';

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
 * Sort keys: priority fields first (in columnOrder order),
 * then the rest in natural order.
 */
function sortKeys(keys) {
  return [...keys].sort((a, b) => {
    const indexA = columnOrder.indexOf(a);
    const indexB = columnOrder.indexOf(b);

    if (indexA !== -1 && indexB !== -1) return indexA - indexB;   // both in list → follow list order
    if (indexA !== -1) return -1;                                   // only a in list → a first
    if (indexB !== -1) return 1;                                    // only b in list → b first
    return 0;                                                        // neither → keep natural order
  });
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

  return sortKeys(keys.filter(key => !excludedFields.includes(key)))
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

      // Link columns – navigate or open external URL
      if (type === 'link') {
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

      return column;
    });
}