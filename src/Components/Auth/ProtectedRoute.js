// ProtectedRoute.js
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../Context/context';
import React from 'react';
const ProtectedRoute = ({ children }) => {
  const { userData } = useContext(UserContext);

  if (!userData.apiKeys) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;