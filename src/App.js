import React, { useState, useRef, useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './Components/Home/home';
import Login from './Components/Login/login';
import Upload from './Components/Upload/upload';
import Pricing from './Components/Pricing/pricing';
import Goods from './Components/Goods/goods';
import FI_reporting from './Components/Finance/fi_reporting';
import FI_overheads from './Components/Finance/fi_overheads';
import CRM_campaigns from './Components/CRM/campaign';
import styles from './CSS/Menu.module.css';
import MyGlobalContext from './Components/Context/context';
import globalData from './Components/Private/apikeys';
import SubMenu from './Components/MenuStructure/SubMenu';
//import './CSS/App.css';
 
function Menu() {
  //  единый объект для состояний подменю
  const [subMenus, setSubMenus] = useState({
    FI: false,
    CRM: false
  });
  const subMenuRef = useRef(null);

  const subMenuItems = {
    FI: [
      { path: "/Fi/Reports", label: "Отчеты" },
      { path: "/Fi/Overheads", label: "Накладные расходы" }
    ],
    CRM: [
      { path: "/CRM/campaign", label: "Рекламные компании" }
    ]
  };
//  Универсальная функция для всех подменю
  const toggleSubMenu = (menuId, event) => {
    event.preventDefault();
    setSubMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  // Обработчик клика вне подменю (Закрываем все подменю)
  useEffect(() => {
    function handleClickOutside(event) {
      if (subMenuRef.current && !subMenuRef.current.contains(event.target)) {
        setSubMenus({ FI: false, CRM: false });
      }
    }
    // Привязываем обработчики
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Отвязываем обработчики при размонтировании компонента
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [subMenuRef]);

  return (
    <div className={styles.menuContainer}>
      <nav>
        <ul className={styles.navbar}>
          <li><Link to="/">Главная</Link></li>
          <li><Link to="/Upload">Загрузка</Link></li>
          <li><Link to="/Goods">Товары</Link></li>
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
          <li><Link to="/Pricing">Изменение цен</Link></li>
          <li><Link to="/login">Вход</Link></li>
        </ul>
      </nav>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div>
      <MyGlobalContext.Provider value={globalData}>
        <Menu />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Upload" element={<Upload />} />
          <Route path="/goods" element={<Goods />} />
          <Route path="/Fi/Reports" element={<FI_reporting />} />
          <Route path="/Fi/Overheads" element={<FI_overheads />} />
          <Route path="/CRM/Campaign" element={<CRM_campaigns />} />
          <Route path="/Pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
        </Routes>
        </MyGlobalContext.Provider>,
      </div>
    </Router>
  );
}

export default App;