// src/App.js
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, UserContext } from './context/context';
import MenuWrapper from './components/layout/MenuWrapper';
import ProtectedRoute from './router/ProtectedRoute';
import FI_WBReportsList from './pages/finance/FI_WBReportsList';

// Страницы
// Home
import Home from './pages/home/home';

// Auth
import Login from './pages/login/login';
import Register from './pages/Register';

// Upload
import Upload from './pages/upload/upload';

// Goods
import Goods from './pages/goods/goods';
import GoodsTypes from './pages/goods/GoodsTypes';
import GoodsGroups from './pages/goods/GoodsGroups.jsx';

// FI
import FI_OverheadGroups from './pages/finance/FI_overheadGroups.jsx';
import FI_OverheadTypes from './pages/finance/FI_OverheadTypes';
import FI_OverheadValues from './pages/finance/FI_OverheadValues';
import Pricing from './pages/pricing/pricing';

// CRM
import Campaigns from './pages/adverts/campaigns';
import AllCampaigns from './pages/adverts/allcampaigns';

// API
import Apikeysupload from './features/apikeys/apikeysupload';

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
            <Route path="/goods/types" element={<GoodsTypes />} />
            <Route path="/goods/groups" element={<GoodsGroups />} />
            <Route path="/fi/overheads/groups" element={<FI_OverheadGroups />} />
            <Route path="/fi/overheads/types" element={<FI_OverheadTypes />} />
            <Route path="/fi/overheads/values" element={<FI_OverheadValues />} />
            <Route path="/fi/wbreports/list" element={<FI_WBReportsList />} />
            <Route path="/crm/campaign" element={<Campaigns />} />
            <Route path="/crm/allcampaigns" element={<AllCampaigns />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/apikeysupload" element={<Apikeysupload />} />
          </Route>
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;