import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import '../styles/Layout.css';

const Layout = () => {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
