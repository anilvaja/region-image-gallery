import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/NavBar.css';

const NavBar = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRegionId');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/home')}>
        <span className="navbar-logo">◑</span>
        <span className="navbar-title">Region Gallery</span>
      </div>

      <div className="navbar-links">
        <NavLink to="/home" className="navbar-link">
          Home
        </NavLink>
        <NavLink to="/region" className="navbar-link">
          Region
        </NavLink>
        <NavLink to="/project" className="navbar-link">
          Project
        </NavLink>
        <NavLink to="/settings" className="navbar-link">
          Settings
        </NavLink>
      </div>

      <div className="navbar-user">
        {userName && <span className="navbar-username">{userName}</span>}
        <button onClick={handleLogout} className="navbar-logout">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
