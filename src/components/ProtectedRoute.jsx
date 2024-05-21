import React from 'react';
import { Route, Navigate } from 'react-router-dom';

const ProtectedRouteElement = ({ children, ...rest }) => {
  // Check if the user is authenticated (you can implement this logic)
  const isAuthenticated = localStorage.getItem('token'); // Assuming you have a token in localStorage

  return isAuthenticated ? (
    children
  ) : (
    <Navigate to="/LoginForm" replace /> // Redirect to the login page
  );
};

const ProtectedRoute = ({ children, ...rest }) => (
  <Route {...rest} element={<ProtectedRouteElement>{children}</ProtectedRouteElement>} />
);

export default ProtectedRoute;