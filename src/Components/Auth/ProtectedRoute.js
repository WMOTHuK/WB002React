// ProtectedRoute.js
import React from 'react';

import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { UserContext } from '../Context/context';

const ProtectedRoute = () => {
  const { userData, authChecked } = useContext(UserContext);

  if (!authChecked) return <div>Проверка авторизации...</div>;
  if (!userData?.userInfo?.token) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
