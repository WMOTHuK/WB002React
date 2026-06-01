// src/config/columnPresets.js

/**
 * Field types mapped to their accessorKeys.
 * Any field not listed here defaults to 'text'.
 */
export const columnTypes = {
  link:      ['nmid', 'advertid'],
  image:     ['big'],
  checkbox:  ['active', 'deleted'],
  number:    ['sprice', 'price', 'discount', 'currentprice', 'dayprice', 'daydisc', 'nightprice', 'nightdisc', 'subjectid', 'imtid'],
  date:      ['pause_time', 'restart_time'],
  text:      [],
};

/**
 * Fields that become editable when mode === 'edit'.
 */
export const editableFields = [
  'sprice',
  'dayprice',
  'daydisc',
  'nightprice',
  'nightdisc',
  'active',
  'deleted',
];

/**
 * Fields always excluded
 */

export const excludedFields = [
  'imtid',
  'subjectid',
];