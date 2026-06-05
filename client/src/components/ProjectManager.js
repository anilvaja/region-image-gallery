import React, { useEffect, useState } from 'react';
import { projectAPI } from '../api';
import '../styles/ProjectManager.css';

const ProjectManager = ({ onProjectsChange }) => {
  const [projects, setProjects] = useState([]);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const userRegionId = localStorage.getItem('userRegionId');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getUserProjects();
      setProjects(response.data.projects);
    } catch (err) {
      setError('Failed to load projects: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) {
      setError('Project title is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await projectAPI.createProject({
        title: newProjectTitle,
        description: newProjectDesc,
        region_id: parseInt(userRegionId),
      });

      setSuccess('Project created successfully!');
      setNewProjectTitle('');
      setNewProjectDesc('');
      fetchProjects();
      if (onProjectsChange) onProjectsChange();
    } catch (err) {
      setError('Failed to create project: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await projectAPI.deleteProject(projectId);
      setSuccess('Project deleted successfully!');
      fetchProjects();
      if (onProjectsChange) onProjectsChange();
    } catch (err) {
      setError('Failed to delete project: ' + err.message);
    }
  };

  return (
    <div className="project-manager-container">
      <h1>My Projects</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleCreateProject} className="create-project-form">
        <h2>Create New Project</h2>
        <div className="form-group">
          <label htmlFor="title">Project Title</label>
          <input
            type="text"
            id="title"
            value={newProjectTitle}
            onChange={(e) => setNewProjectTitle(e.target.value)}
            placeholder="Enter project title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <textarea
            id="description"
            value={newProjectDesc}
            onChange={(e) => setNewProjectDesc(e.target.value)}
            placeholder="Enter project description"
            rows="3"
          />
        </div>

        <button type="submit" disabled={loading} className="create-button">
          {loading ? 'Creating...' : 'Create Project'}
        </button>
      </form>

      <div className="projects-list">
        <h2>Your Projects in Region {userRegionId}</h2>

        {projects.length === 0 ? (
          <p className="no-projects">No projects yet. Create one above!</p>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project.id} className="project-card">
                <h3>{project.title}</h3>
                {project.description && <p>{project.description}</p>}
                <div className="project-meta">
                  <span className="project-date">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectManager;
