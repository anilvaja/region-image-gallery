import React, { useState } from 'react';
import ProjectManager from '../components/ProjectManager';
import UploadForm from '../components/UploadForm';
import '../styles/ProjectPage.css';

const ProjectPage = () => {
  const [projectsVersion, setProjectsVersion] = useState(0);

  return (
    <div className="project-page">
      <header className="project-page-header">
        <h1>Projects</h1>
        <p>Create projects in your region and upload images to them.</p>
      </header>

      <div className="project-page-grid">
        <section className="project-card-panel">
          <UploadForm
            projectsVersion={projectsVersion}
            onUploadSuccess={() => {}}
          />
        </section>

        <section className="project-card-panel">
          <ProjectManager
            onProjectsChange={() => setProjectsVersion((v) => v + 1)}
          />
        </section>
      </div>
    </div>
  );
};

export default ProjectPage;
