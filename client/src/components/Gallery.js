import React, { useEffect, useState } from 'react';
import { imageAPI } from '../api';
import '../styles/Gallery.css';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const response = await imageAPI.getGallery();
      setImages(response.data.images);
    } catch (err) {
      setError('Failed to load gallery: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="gallery-container">Loading gallery...</div>;
  if (error) return <div className="gallery-container error">{error}</div>;

  return (
    <div className="gallery-container">
      <h1>Image Gallery - All Regions</h1>
      <p className="gallery-subtitle">
        Viewing {images.length} images across all regions
      </p>

      {images.length === 0 ? (
        <div className="gallery-empty">
          <p>No images available yet</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {images.map((image) => (
            <div key={image.id} className="gallery-item">
              <img
                src={image.optimized_url}
                alt={image.file_name}
                className="gallery-image"
              />
              <div className="gallery-info">
                <p className="image-project">
                  Project: {image.Project?.title}
                </p>
                <p className="image-user">
                  User: {image.Project?.User?.name}
                </p>
                <p className="image-region">
                  Region: {image.Project?.region_id}
                </p>
                <p className="image-date">
                  {new Date(image.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
