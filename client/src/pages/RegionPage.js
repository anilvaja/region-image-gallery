import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { imageAPI, regionAPI } from '../api';
import '../styles/RegionPage.css';

const RegionPage = () => {
  const navigate = useNavigate();
  const [regions, setRegions] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [regionRes, galleryRes] = await Promise.all([
          regionAPI.getRegions(),
          imageAPI.getGallery(),
        ]);
        setRegions(regionRes.data.regions || []);
        setImages(galleryRes.data.images || []);
      } catch (err) {
        setError('Failed to load regions: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const countByRegion = useMemo(() => {
    const counts = {};
    images.forEach((img) => {
      const rid = img.Project?.region_id;
      if (rid != null) counts[rid] = (counts[rid] || 0) + 1;
    });
    return counts;
  }, [images]);

  if (loading) return <div className="region-status">Loading regions…</div>;
  if (error) return <div className="region-status region-error">{error}</div>;

  return (
    <div className="region-page">
      <header className="region-header">
        <h1>Regions</h1>
        <p>Browse the gallery by region.</p>
      </header>

      <div className="region-grid">
        {regions.map((region) => {
          const count = countByRegion[region.id] || 0;
          return (
            <button
              type="button"
              key={region.id}
              className="region-card"
              onClick={() => navigate(`/home?region=${region.id}`)}
            >
              <span className="region-card-name">{region.name}</span>
              <span className="region-card-count">
                {count} image{count === 1 ? '' : 's'}
              </span>
              <span className="region-card-cta">View gallery →</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RegionPage;
