import React, { useEffect, useState } from 'react';
import { settingsAPI } from '../api';
import '../styles/SettingsPage.css';

const SettingsPage = () => {
  const [maxImages, setMaxImages] = useState('');
  const [maxFileSize, setMaxFileSize] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await settingsAPI.getSettings();
        const s = res.data.settings || {};
        setMaxImages(String(s.max_images_per_project ?? ''));
        setMaxFileSize(String(s.max_file_size_mb ?? ''));
      } catch (err) {
        setError('Failed to load settings: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const res = await settingsAPI.updateSettings({
        max_images_per_project: Number(maxImages),
        max_file_size_mb: Number(maxFileSize),
      });
      const s = res.data.settings || {};
      setMaxImages(String(s.max_images_per_project ?? ''));
      setMaxFileSize(String(s.max_file_size_mb ?? ''));
      setSuccess('Settings saved.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="settings-status">Loading settings…</div>;

  return (
    <div className="settings-page">
      <header className="settings-header">
        <h1>Settings</h1>
        <p>Manage global image upload limits. Changes apply to all users immediately.</p>
      </header>

      <form className="settings-card" onSubmit={handleSubmit}>
        <div className="settings-field">
          <label htmlFor="maxImages">Max images per project</label>
          <input
            id="maxImages"
            type="number"
            min="1"
            value={maxImages}
            onChange={(e) => setMaxImages(e.target.value)}
            required
          />
          <span className="settings-hint">Maximum number of images that can be uploaded to a single project.</span>
        </div>

        <div className="settings-field">
          <label htmlFor="maxFileSize">Max image file size (MB)</label>
          <input
            id="maxFileSize"
            type="number"
            min="1"
            value={maxFileSize}
            onChange={(e) => setMaxFileSize(e.target.value)}
            required
          />
          <span className="settings-hint">Uploads larger than this size are rejected.</span>
        </div>

        {error && <div className="settings-message settings-error">{error}</div>}
        {success && <div className="settings-message settings-success">{success}</div>}

        <button type="submit" className="settings-save" disabled={saving}>
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </form>
    </div>
  );
};

export default SettingsPage;
