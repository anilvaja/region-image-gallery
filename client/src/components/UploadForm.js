import React, { useState, useEffect } from 'react';
import { imageAPI, projectAPI, settingsAPI } from '../api';
import '../styles/UploadForm.css';

const UploadForm = ({ projectsVersion, onUploadSuccess }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [maxImages, setMaxImages] = useState(10);
  const [maxFileSizeMb, setMaxFileSizeMb] = useState(5);

  const userRegionId = localStorage.getItem('userRegionId');

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectsVersion]);

  useEffect(() => {
    settingsAPI
      .getSettings()
      .then((res) => {
        const s = res.data.settings || {};
        if (s.max_images_per_project != null) setMaxImages(s.max_images_per_project);
        if (s.max_file_size_mb != null) setMaxFileSizeMb(s.max_file_size_mb);
      })
      .catch(() => {});
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getUserProjects();
      // Filter projects by user's region
      const userProjects = response.data.projects.filter(
        (p) => p.region_id === parseInt(userRegionId)
      );
      setProjects(userProjects);
      setSelectedProject((current) => {
        const stillExists = userProjects.some(
          (p) => String(p.id) === String(current)
        );
        if (current && stillExists) return current;
        return userProjects.length > 0 ? userProjects[0].id : '';
      });
    } catch (err) {
      setError('Failed to load projects: ' + err.message);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > maxFileSizeMb * 1024 * 1024) {
        setError(`File size must be less than ${maxFileSizeMb}MB`);
        setFile(null);
      } else if (!selectedFile.type.startsWith('image/')) {
        setError('File must be an image');
        setFile(null);
      } else {
        setFile(selectedFile);
        setError('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !selectedProject) {
      setError('Please select a project and file');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await imageAPI.uploadImage(selectedProject, file);
      setSuccess('Image uploaded successfully!');
      setFile(null);
      // Reset file input
      e.target.reset();
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      setError('Upload failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Image</h2>
      <p className="upload-subtitle">
        Upload images to your projects (max {maxImages} per project, {maxFileSizeMb}MB file size)
      </p>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="project">Select Project</label>
          <select
            id="project"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            required
            disabled={projects.length === 0}
          >
            <option value="">
              {projects.length === 0 ? 'No projects available' : 'Choose a project'}
            </option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="file">Select Image</label>
          <input
            type="file"
            id="file"
            accept="image/*"
            onChange={handleFileChange}
            required
          />
          {file && (
            <p className="file-info">
              Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !file || !selectedProject}
          className="upload-button"
        >
          {loading ? 'Uploading...' : 'Upload Image'}
        </button>
      </form>

      {projects.length === 0 && (
        <p className="no-projects-message">
          Create a project first to upload images
        </p>
      )}
    </div>
  );
};

export default UploadForm;
