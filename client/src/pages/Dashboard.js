import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectManager from '../components/ProjectManager';
import UploadForm from '../components/UploadForm';
import Gallery from '../components/Gallery';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName');
  const userRegionId = localStorage.getItem('userRegionId');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRegionId');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h1>Image Gallery</h1>
        </div>
        <div className="nav-user">
          <span className="user-info">
            {userName} • Region {userRegionId}
          </span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <ProjectManager />
        </div>

        <div className="dashboard-section">
          <UploadForm />
        </div>

        <div className="dashboard-section">
          <Gallery />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
