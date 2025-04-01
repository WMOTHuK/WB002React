import React from 'react';
import styles from '../../CSS/styles.module.css'
import Goodsmain from './goodsmain';

export  function goods() {
    return <div className={styles.pagecontainer}>
      <Goodsmain />
    </div>;
  }
  
  export default goods;