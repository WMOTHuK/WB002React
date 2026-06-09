// src/components/layout/MenuWrapper.jsx
import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/context';
import SubMenu from './SubMenu';
import styles from '../../styles/Menu.module.css';

const subMenuItems = {
  FI: [
    { path: "/fi/reports", label: "Отчеты" },
    { path: "/fi/overheads/groups", label: "Группы накладных" },
    { path: "/fi/overheads/types", label: "Категории накладных" },
    { path: "/fi/overheads/values", label: "Значения накладных" },
  ],
  CRM: [
    { path: "/crm/campaign", label: "Рекламные компании" }
  ],
  Goods: [
    { path: "/goods", label: "Список товаров" },
    { path: "/goods/types", label: "Типы товаров" },
    { path: "/goods/groups", label: "Группы товаров" },
  ],
};

const MenuWrapper = () => {
  const { userData, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const [subMenus, setSubMenus] = useState({ FI: false, CRM: false, Goods: false });
  const subMenuRef = useRef(null);

  const toggleSubMenu = (menuId, event) => {
    event.preventDefault();
    setSubMenus(prev => ({
      FI: false,
      CRM: false,
      Goods: false,
      [menuId]: !prev[menuId]
    }));
  };

  const handleLogout = () => {
    if (window.confirm('Вы уверены, что хотите выйти?')) {
      logout();
      navigate('/');
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (subMenuRef.current && !subMenuRef.current.contains(event.target)) {
        setSubMenus({ FI: false, CRM: false, Goods: false });
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!userData) return null;

  return (
    <div className={styles.menuContainer}>
      <nav>
        <ul className={styles.navbar}>
          <li><Link to="/">Главная</Link></li>
          {userData?.userInfo?.token ? (
            <>
              <li><Link to="/upload">Загрузка</Link></li>
              <li className={styles.fakeli} onClick={(e) => toggleSubMenu('Goods', e)}>
                Товары
                <SubMenu
                  items={subMenuItems.Goods}
                  isVisible={subMenus.Goods}
                  menuRef={subMenuRef}
                />
              </li>
              <li className={styles.fakeli} onClick={(e) => toggleSubMenu('FI', e)}>
                Финансы
                <SubMenu
                  items={subMenuItems.FI}
                  isVisible={subMenus.FI}
                  menuRef={subMenuRef}
                />
              </li>
              <li className={styles.fakeli} onClick={(e) => toggleSubMenu('CRM', e)}>
                Продвижение
                <SubMenu
                  items={subMenuItems.CRM}
                  isVisible={subMenus.CRM}
                  menuRef={subMenuRef}
                />
              </li>
              <li><Link to="/pricing">Изменение цен</Link></li>
              <li><Link to="/apikeysupload">Ключи API</Link></li>
              <li>
                <button onClick={handleLogout} className={styles.fakeli}>
                  Выход
                </button>
              </li>
              <li className={styles.userInfo}>
                Вы вошли как: <span>{userData.userInfo.login}</span>
              </li>
            </>
          ) : (
            <li><Link to="/login">Вход</Link></li>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default MenuWrapper;