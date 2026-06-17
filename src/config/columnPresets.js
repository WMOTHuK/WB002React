// src/config/columnPresets.js

/**
 * Field types mapped to their accessorKeys.
 * Any field not listed here defaults to 'text'.
 */
export const columnTypes = {
  link:      ['nmid', 'advertid', 'ozid', 'report_id'],
  image:     ['card_photo'],
  checkbox:  ['active', 'deleted', 'has_link', '_linked'],
  number:    ['current_cost', 'price', 'discount', 'currentprice', 'dayprice', 'daydisc', 'nightprice', 'nightdisc', 'subjectid', 'imtid', 
              "bank_payment_sum", "penalty_sum", "deduction_sum", "paid_acceptance_sum", "paid_storage_sum", "delivery_service_sum",
              "for_pay_sum", "retail_amount_sum"],
  date:      ['pause_time', 'restart_time', 'change_date'],
  select:    ['oh_grp_sel', 'goods_type_sel', 'goods_grp_sel'],
  text:      [ 'oh_name', 'oh_desc', 'oh_grp_name', 'oh_grp_desc','goods_grp_name', 'goods_grp_desc','goods_type_name', 'goods_type_desc'],
  button:    ['_groups', '_cards', 'cards', '_costs'],
  custom:    ['_actions', 'has_items'],
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
  'change_date',
  'has_link',
  '_linked'
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
  'goods_grp_id',
  'user_id',
  'crmtype',
  'crmstatus',
];

/**
 * URL builders for link-type fields.
 * Each function receives the row data and returns a URL.
 */
export const linkUrls = {
  nmid: (row) => `https://www.wildberries.ru/catalog/${row.nmid}/detail.aspx?targetUrl=GP`,
  ozid: (row) => `https://www.ozon.ru/product/${row.ozid}`,
  advertid: (row) => `https://cmp.wildberries.ru/campaigns/edit/36280250?advertID=${row.advertid}`,
  report_id: (row) => `https://seller.wildberries.ru/suppliers-mutual-settlements/reports-implementations/reports-weekly-new/report/${row.report_id}`
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

/**
 * Button columns configuration.
 * key: accessorKey
 * value: { label, onClick? }
 */
export const buttonColumns = {
  cards: { label: 'Карточки', style: 'btnPrimary',
  },
  _groups: { label: '+ Группа', style: 'btnPrimary',
  },
  _cards: { label: '+ Карточки', style: 'btnPrimary',
  },
  _costs: { label: 'Затраты', style: 'btnPrimary' },
};

export const columnFormats = {
  currency: [
'sprice', 
'current_cost', 
'price', 
'oh_amount', 
'dayprice', 
'nightprice', 
"bank_payment_sum",
"penalty_sum",
"deduction_sum",
"paid_acceptance_sum",
"paid_storage_sum",
"delivery_service_sum",
"for_pay_sum",
"retail_amount_sum"],
};