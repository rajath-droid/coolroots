import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { currentUser } = useStore();
  const location = useLocation();

  if (!currentUser) {
    return (
      <Navigate
        to="/signin"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return children;
}
