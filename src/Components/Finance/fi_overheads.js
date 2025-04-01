import React from 'react';
import styles from '../../CSS/styles.module.css'
import InsertionTable from '../General/insertiontable';


function FI_overheads() {

  const insdata = [
    { fname: 'name', ftype: 'text', fvalues: [] },
    { fname: 'birthdate', ftype: 'date', fvalues: [] },
    { fname: 'department', ftype: 'select', fvalues: ['HR', 'Tech', 'Sales'] }
  ];
  return  <div className={styles.pagecontainer}>
  <div className={styles.vidget}>
    <InsertionTable insdata={insdata} nrows={5} />
  </div>
  <div className={styles.vidget}>
    <p>Заглушка FI накладные показ</p>
  </div>
</div>;
}

export default FI_overheads;