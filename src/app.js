require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const { UPLOADS_DIR } = require('./config/paths');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const imageRoutes = require('./routes/imageRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const fs = require('fs');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded files from local uploads directory
app.use('/uploads', express.static(UPLOADS_DIR));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/images', imageRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error: ' + err.message,
  });
});

// Database connection and server startup
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Sync database models
    await sequelize.authenticate();
    console.log('Database connected successfully');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
