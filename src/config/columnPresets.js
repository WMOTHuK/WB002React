// src/config/columnPresets.js

/**
 * Field types mapped to their accessorKeys.
 * Any field not listed here defaults to 'text'.
 */
export const columnTypes = {
  link:      ['nmid', 'advertid', 'ozid'],
  image:     ['card_photo'],
  checkbox:  ['active', 'deleted'],
  number:    ['current_cost', 'price', 'discount', 'currentprice', 'dayprice', 'daydisc', 'nightprice', 'nightdisc', 'subjectid', 'imtid'],
  date:      ['pause_time', 'restart_time', 'change_date'],
  select:    ['oh_grp_sel', 'goods_type_sel', 'goods_grp_sel'],
  text:      [ 'oh_name', 'oh_desc', 'oh_grp_name', 'oh_grp_desc','goods_grp_name', 'goods_grp_desc','goods_type_name', 'goods_type_desc'],
};

/**
 * Fields that become editable when mode === 'edit'.
 */
export const editableFields = [
  'current_cost',
  'dayprice',
  'daydisc',
  'nightprice',
  'nightdisc',
  'active',
  'deleted',
  'change_date'
];

/**
 * Fields always excluded
 */

export const excludedFields = [
  'imtid',
  'subjectid',
  'id',
  'ohcat_id',
  'oh_grp_id',
  'goods_type_id',
  'goods_grp_id'
];

/**
 * URL builders for link-type fields.
 * Each function receives the row data and returns a URL.
 */
export const linkUrls = {
  nmid: (row) => `https://www.wildberries.ru/catalog/${row.nmid}/detail.aspx?targetUrl=GP`,
  ozid: (row) => `https://www.ozon.ru/product/${row.ozid}`
  //advertid: (row) => `/adverts/${row.advertid}`,
  // user_id:  (row) => `/users/${row.user_id}`,
};

/**
 * Column display order.
 * Fields listed here appear first, in this exact order.
 * All other fields follow in their natural order from the data.
 */
export const columnOrder = [

];

export const inputStyles = {
  oh_name:        'inputMedium',
  oh_description: 'textarea', 
  oh_grp_name:    'inputMedium',    
  oh_grp_desc:    'textarea',
  goods_grp_name: 'inputMedium',
  goods_grp_desc: 'textarea',  
  goods_type_name: 'inputMedium',
  goods_type_desc: 'textarea',           
  current_cost:   'inputShort',
  change_date:    'inputShort',
  title:          'inputLong',
  vendorcode:     'inputMedium',
};

export const cellStyles = {
  oh_name: 'bold',
  oh_grp_name: 'bold', 
  goods_grp_name: 'bold',
  goods_type_name: 'bold',
};