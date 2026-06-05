import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { imageAPI, regionAPI } from '../api';
import SliderGallery from '../components/SliderGallery';
import '../styles/Home.css';

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [images, setImages] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const regionFilter = searchParams.get('region') || '';
  const projectFilter = searchParams.get('project') || '';

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [galleryRes, regionRes] = await Promise.all([
          imageAPI.getGallery(),
          regionAPI.getRegions(),
        ]);
        setImages(galleryRes.data.images || []);
        setRegions(regionRes.data.regions || []);
      } catch (err) {
        setError('Failed to load gallery: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Projects available for the project dropdown, scoped to the selected region.
  const projectOptions = useMemo(() => {
    const map = new Map();
    images.forEach((img) => {
      const p = img.Project;
      if (!p) return;
      if (regionFilter && String(p.region_id) !== String(regionFilter)) return;
      if (!map.has(p.id)) map.set(p.id, { id: p.id, title: p.title });
    });
    return Array.from(map.values());
  }, [images, regionFilter]);

  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      const p = img.Project;
      if (!p) return false;
      if (regionFilter && String(p.region_id) !== String(regionFilter)) {
        return false;
      }
      if (projectFilter && String(p.id) !== String(projectFilter)) {
        return false;
      }
      return true;
    });
  }, [images, regionFilter, projectFilter]);

  const updateParams = (next) => {
    const params = {};
    const region = next.region ?? regionFilter;
    const project = next.project ?? projectFilter;
    if (region) params.region = region;
    if (project) params.project = project;
    setSearchParams(params);
  };

  const handleRegionChange = (e) => {
    // Changing region clears the project filter (it may not belong to it).
    const region = e.target.value;
    const params = {};
    if (region) params.region = region;
    setSearchParams(params);
  };

  const handleProjectChange = (e) => {
    updateParams({ project: e.target.value });
  };

  const clearFilters = () => setSearchParams({});

  if (loading) return <div className="home-status">Loading gallery…</div>;
  if (error) return <div className="home-status home-error">{error}</div>;

  return (
    <div className="home">
      <header className="home-header">
        <p className="home-eyebrow">Selected Projects</p>
        <h1 className="home-heading">Region Image Gallery</h1>
      </header>

      <div className="home-filters">
        <div className="filter-group">
          <label htmlFor="region-filter">Region</label>
          <select
            id="region-filter"
            value={regionFilter}
            onChange={handleRegionChange}
          >
            <option value="">All regions</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="project-filter">Project</label>
          <select
            id="project-filter"
            value={projectFilter}
            onChange={handleProjectChange}
          >
            <option value="">All projects</option>
            {projectOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        {(regionFilter || projectFilter) && (
          <button
            type="button"
            className="filter-clear"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        )}

        <span className="filter-count">
          {filteredImages.length} image{filteredImages.length === 1 ? '' : 's'}
        </span>
      </div>

      <SliderGallery images={filteredImages} />
    </div>
  );
};

export default Home;
