import React from 'react';
import styles from '../../styles/styles.module.css';

const StatusMessage = ({ type, children }) => {
  if (!children) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div className={type === 'error' ? styles.error : styles.success}>
        {children}
      </div>
    </div>
  );
};

export default StatusMessage;