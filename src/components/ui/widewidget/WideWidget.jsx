import React from 'react';
import styles from '../../../styles/styles.module.css';

const WideWidget = ({ title, children }) => {
  return (
    <div className={styles.pagecontainer}>
      <div className={styles.vidget}>
        <h2>{title}</h2>
        {children || <p>Контент будет добавлен позже</p>}
      </div>
    </div>
  );
};

export default WideWidget;