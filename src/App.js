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
//import './CSS/App.css';
 
function Menu() {
  const [isFiSubMenuVisible, setFiSubMenuVisible] = useState(false);
  const [isCRMSubMenuVisible, setCRMSubMenuVisible] = useState(false);
  const subMenuRef = useRef(null);
  // Функция для переключения видимости подменю
  const toggleFiSubMenu = (event) => {
    event.preventDefault(); // Предотвращаем переход по ссылке
    setFiSubMenuVisible(!isFiSubMenuVisible);
  };

// Функция для переключения видимости подменю
  const toggleCRMSubMenu = (event) => {
    event.preventDefault(); // Предотвращаем переход по ссылке
    setCRMSubMenuVisible(!isCRMSubMenuVisible);
  };
  // Обработчик клика вне подменю
  useEffect(() => {
    function handleClickOutside(event) {
      if (subMenuRef.current && !subMenuRef.current.contains(event.target)) {
        setFiSubMenuVisible(false);
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
          <li className={styles.fakeli} onClick={toggleFiSubMenu}>
            Финансы {/* Изменено с <Link> на простой текст */}
            {isFiSubMenuVisible && (
              <div ref={subMenuRef} className={styles.subMenuContainer}>
                <ul className={styles.subMenu}>
                  <li><Link to="/Fi/Reports">Отчеты</Link></li>
                  <li><Link to="/Fi/Overheads">Накладные расходы</Link></li>
                </ul>
              </div>
            )}
          </li>
          <li className={styles.fakeli} onClick={toggleCRMSubMenu}>
            Продвижение {/* Изменено с <Link> на простой текст */}
            {isCRMSubMenuVisible && (
              <div ref={subMenuRef} className={styles.subMenuContainer}>
                <ul className={styles.subMenu}>
                  <li><Link to="/CRM/campaign">Рекламные компании</Link></li>
                </ul>
              </div>
            )}
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
          <Route path="/CRM/Campaigns" element={<CRM_campaigns />} />
          <Route path="/Pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
        </Routes>
        </MyGlobalContext.Provider>,
      </div>
    </Router>
  );
}

export default App;