// src/utils/sortAndGroup.js
import React from 'react';

/**
 * Sort data by type → group → name (or custom sort keys).
 * @param {Array} data
 * @param {Object} options
 *   sortKeys: [{ key: 'goods_type_name', type: 'string' }, ...]
 */
export function sortGroupedData(data, sortKeys = []) {
  if (data.length === 0) return [];

  // Default sort keys if not provided
  const keys = sortKeys.length > 0 ? sortKeys : [
    { key: 'goods_type_name', type: 'string' },
    { key: 'goods_grp_name', type: 'string' },
    { key: 'title', type: 'string' },
  ];

  return [...data].sort((a, b) => {
    for (const { key, type } of keys) {
      const valA = a[key] || '';
      const valB = b[key] || '';
      if (valA !== valB) {
        if (type === 'number') return (Number(valA) || 0) - (Number(valB) || 0);
        return String(valA).localeCompare(String(valB));
      }
    }
    return 0;
  });
}

/**
 * Render group separators for a table.
 * @param {Array} groupByKeys – [{ key: 'goods_type_name', label: 'Тип', style: {} }, ...]
 * @param {number} colSpan
 * @returns {function} renderSeparator(row, index, rows)
 */
export function createGroupSeparator(groupByKeys, colSpan) {
  return function renderSeparator(row, index, rows) {
    const prev = rows[index - 1];
    const fragments = [];

    groupByKeys.forEach(({ key, label, style }) => {
      const isFirst = index === 0;
      const changed = isFirst || row[key] !== prev?.[key];
      // Check if any parent group changed (for nested separators)
      const parentChanged = groupByKeys.slice(0, groupByKeys.findIndex(g => g.key === key)).some(g => {
        return isFirst || row[g.key] !== prev?.[g.key];
      });

      if (changed || parentChanged) {
        const displayLabel = label ? `${label}: ${row[key] || 'Без'}` : (row[key] || 'Без');
        fragments.push(
          <tr key={`sep-${key}-${row.id || index}`}>
            <td colSpan={colSpan} style={{
              textAlign: 'left',
              fontWeight: key === groupByKeys[0].key ? 'bold' : 'normal',
              padding: key === groupByKeys[0].key ? '8px' : '4px',
              background: key === groupByKeys[0].key ? '#d0d0d0' : '#f0f0f0',
              ...style,
            }}>
              {displayLabel}
            </td>
          </tr>
        );
      }
    });

    return <>{fragments}</>;
  };
}