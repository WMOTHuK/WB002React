// src/App.js
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, UserContext } from './context/context';
import MenuWrapper from './components/layout/MenuWrapper';
import ProtectedRoute from './router/ProtectedRoute';

// Страницы
import Home from './pages/home/home';
import Login from './pages/login/login';
import Register from './pages/Register';
import Upload from './pages/upload/upload';
import Goods from './pages/goods/goods';
import Pricing from './pages/pricing/pricing';
import FI_reporting from './pages/finance/fi_reporting';
import CRM_campaigns from './pages/adverts/campaign';
import Apikeysupload from './features/apikeys/apikeysupload';
import FI_OverheadTypes from './pages/finance/FI_OverheadTypes';
import FI_OverheadValues from './pages/finance/FI_OverheadValues';

const LoginRoute = () => {
  const { userData, authChecked } = useContext(UserContext);

  if (!authChecked) return <div>Проверка авторизации...</div>;
  return userData?.userInfo?.token ? <Navigate to="/" /> : <Login />;
};

function App() {
  return (
    <UserProvider>
      <Router>
        <MenuWrapper />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/upload" element={<Upload />} />
            <Route path="/goods" element={<Goods />} />
            <Route path="/fi/reports" element={<FI_reporting />} />
            <Route path="/fi/overheads/types" element={<FI_OverheadTypes />} />
            <Route path="/fi/overheads/values" element={<FI_OverheadValues />} />
            <Route path="/crm/campaign" element={<CRM_campaigns />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/apikeysupload" element={<Apikeysupload />} />
          </Route>
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;