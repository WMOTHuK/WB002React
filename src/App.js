//app.js
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import Home from './components/Home/home';
import Login from './components/Login/login';
import Upload from './components/Upload/upload';
import Pricing from './components/Pricing/pricing';
import Goods from './components/Goods/goods';
import Apikeysupload from './features/apikeys/apikeysupload';
import FI_reporting from './components/Finance/fi_reporting';
import FI_overheads from './components/Finance/fi_overheads';
import CRM_campaigns from './components/CRM/campaign';
import styles from './styles/Menu.module.css';
import { UserProvider, UserContext } from './context/context';
import SubMenu from './components/MenuStructure/SubMenu';
import ProtectedRoute from './router/ProtectedRoute';
import Register from './components/Register/Register';


const MenuWrapper = () => {
  const { userData, logout } = useContext(UserContext);
  const navigate = useNavigate(); 

  // Перенесли все хуки сюда
  const [subMenus, setSubMenus] = React.useState({
    FI: false,
    CRM: false
  });
  const subMenuRef = React.useRef(null);

  const subMenuItems = {
    FI: [
      { path: "/Fi/Reports", label: "Отчеты" },
      { path: "/Fi/Overheads", label: "Накладные расходы" }
    ],
    CRM: [
      { path: "/CRM/campaign", label: "Рекламные компании" }
    ]
  };

  const toggleSubMenu = (menuId, event) => {
    event.preventDefault();
    setSubMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (subMenuRef.current && !subMenuRef.current.contains(event.target)) {
        setSubMenus({ FI: false, CRM: false });
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [subMenuRef]);

  if (!userData) return null;

  return (
    <div className={styles.menuContainer}>
      <nav>
        <ul className={styles.navbar}>
          <li><Link to="/">Главная</Link></li>
          {userData?.userInfo?.token ? (
            <>
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
              <li><Link to="/apikeysupload">Ключи API</Link></li>
              <li>
                <button onClick={() => {
                  if (window.confirm('Вы уверены, что хотите выйти?')) {
                    logout();
                    navigate('/');
                  }
                }} className={styles.fakeli}>
                  Выход
                </button>
              </li>
              {/* Добавляем информацию о пользователе */}
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

const LoginRoute = () => {
  const { userData, authChecked } = useContext(UserContext);
  
  if (!authChecked) return <div>Проверка авторизации...</div>;
  return userData?.userInfo?.token ? <Navigate to="/" /> : <Login />;
};

function App() {
  return (
    <UserProvider>
      <Router>
        <div>
          <MenuWrapper />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/register" element={<Register />} />
            {/* Защищенные маршруты */}
            <Route element={<ProtectedRoute />}>
              <Route path="/upload" element={<Upload />} />
              <Route path="/goods" element={<Goods />} />
              <Route path="/fi/reports" element={<FI_reporting />} />
              <Route path="/fi/overheads" element={<FI_overheads />} />
              <Route path="/crm/campaign" element={<CRM_campaigns />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/apikeysupload" element={<Apikeysupload />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;