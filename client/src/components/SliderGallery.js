import React, { useEffect, useCallback, useState } from 'react';
import { resolveAssetUrl } from '../api';
import '../styles/SliderGallery.css';

const SliderGallery = ({ images }) => {
  const [current, setCurrent] = useState(0);

  const total = images.length;

  // Keep the index in range whenever the (filtered) image set changes.
  useEffect(() => {
    setCurrent(0);
  }, [images]);

  const goTo = useCallback(
    (index) => {
      if (total === 0) return;
      setCurrent((index + total) % total);
    },
    [total]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  if (total === 0) {
    return (
      <div className="slider-empty">
        <p>No images match the selected filters.</p>
      </div>
    );
  }

  const image = images[current];
  const project = image.Project || {};
  const regionName = project.Region?.name || `Region ${project.region_id ?? ''}`;

  return (
    <div className="slider">
      <div className="slider-stage">
        <button
          type="button"
          className="slider-arrow slider-arrow-left"
          onClick={prev}
          aria-label="Previous image"
        >
          ‹
        </button>

        <div className="slider-figure">
          <img
            src={resolveAssetUrl(image.optimized_url)}
            alt={image.file_name}
            className="slider-image"
          />
        </div>

        <button
          type="button"
          className="slider-arrow slider-arrow-right"
          onClick={next}
          aria-label="Next image"
        >
          ›
        </button>
      </div>

      <div className="slider-caption">
        <span className="slider-counter">
          {current + 1} / {total}
        </span>
        <h2 className="slider-project">{project.title || 'Untitled'}</h2>
        <p className="slider-region">{regionName}</p>
        <p className="slider-meta">
          {project.User?.name ? `${project.User.name} · ` : ''}
          {new Date(image.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="slider-thumbs">
        {images.map((img, i) => (
          <button
            type="button"
            key={img.id}
            className={`slider-thumb ${i === current ? 'is-active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Go to image ${i + 1}`}
          >
            <img src={resolveAssetUrl(img.optimized_url)} alt={img.file_name} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default SliderGallery;
