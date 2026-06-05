import React, { useEffect, useState } from 'react';
import { projectAPI, imageAPI, resolveAssetUrl } from '../api';
import '../styles/ProjectManager.css';

const getErr = (err) => err.response?.data?.error || err.message;

const ProjectManager = ({ onProjectsChange }) => {
  const [projects, setProjects] = useState([]);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Inline edit state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Per-project image management state
  const [managingId, setManagingId] = useState(null);
  const [images, setImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);

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
      setError('Failed to load projects: ' + getErr(err));
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
      setError('Failed to create project: ' + getErr(err));
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (project) => {
    setEditingId(project.id);
    setEditTitle(project.title);
    setEditDesc(project.description || '');
    setError('');
    setSuccess('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDesc('');
  };

  const handleSaveEdit = async (projectId) => {
    if (!editTitle.trim()) {
      setError('Project title is required');
      return;
    }
    try {
      setError('');
      setSuccess('');
      await projectAPI.updateProject(projectId, {
        title: editTitle,
        description: editDesc,
      });
      setSuccess('Project updated successfully!');
      cancelEdit();
      fetchProjects();
      if (onProjectsChange) onProjectsChange();
    } catch (err) {
      setError('Failed to update project: ' + getErr(err));
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await projectAPI.deleteProject(projectId);
      setSuccess('Project deleted successfully!');
      if (managingId === projectId) setManagingId(null);
      fetchProjects();
      if (onProjectsChange) onProjectsChange();
    } catch (err) {
      setError('Failed to delete project: ' + getErr(err));
    }
  };

  const toggleManageImages = async (projectId) => {
    if (managingId === projectId) {
      setManagingId(null);
      setImages([]);
      return;
    }
    setManagingId(projectId);
    await fetchImages(projectId);
  };

  const fetchImages = async (projectId) => {
    try {
      setImagesLoading(true);
      const response = await imageAPI.getProjectImages(projectId);
      setImages(response.data.images);
    } catch (err) {
      setError('Failed to load images: ' + getErr(err));
    } finally {
      setImagesLoading(false);
    }
  };

  const handleDeleteImage = async (imageId, projectId) => {
    if (!window.confirm('Delete this image? This cannot be undone.')) {
      return;
    }
    try {
      setError('');
      setSuccess('');
      await imageAPI.deleteImage(imageId);
      setSuccess('Image deleted successfully!');
      await fetchImages(projectId);
      if (onProjectsChange) onProjectsChange();
    } catch (err) {
      setError('Failed to delete image: ' + getErr(err));
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
                {editingId === project.id ? (
                  <div className="project-edit">
                    <div className="form-group">
                      <label>Title</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Project title"
                      />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows="2"
                        placeholder="Project description"
                      />
                    </div>
                    <div className="project-actions">
                      <button
                        onClick={() => handleSaveEdit(project.id)}
                        className="save-button"
                      >
                        Save
                      </button>
                      <button onClick={cancelEdit} className="cancel-button">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3>{project.title}</h3>
                    {project.description && <p>{project.description}</p>}
                    <div className="project-meta">
                      <span className="project-date">
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="project-actions">
                      <button
                        onClick={() => startEdit(project)}
                        className="edit-button"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleManageImages(project.id)}
                        className="manage-button"
                      >
                        {managingId === project.id ? 'Hide Images' : 'Manage Images'}
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}

                {managingId === project.id && (
                  <div className="project-images">
                    {imagesLoading ? (
                      <p>Loading images...</p>
                    ) : images.length === 0 ? (
                      <p className="no-images">No images in this project.</p>
                    ) : (
                      <div className="project-images-grid">
                        {images.map((image) => (
                          <div key={image.id} className="project-image-item">
                            <img
                              src={resolveAssetUrl(image.optimized_url)}
                              alt={image.title || image.file_name}
                              className="project-image-thumb"
                            />
                            <button
                              onClick={() =>
                                handleDeleteImage(image.id, project.id)
                              }
                              className="image-delete-button"
                              title="Delete image"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectManager;
