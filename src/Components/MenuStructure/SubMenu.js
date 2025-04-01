import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../CSS/Menu.module.css';

const SubMenu = ({ items, isVisible, menuRef }) => {
  if (!isVisible) return null;

  return (
    <div ref={menuRef} className={styles.subMenuContainer}>
      <ul className={styles.subMenu}>
        {items.map((item) => (
          <li key={item.path}>
            <Link to={item.path}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SubMenu;