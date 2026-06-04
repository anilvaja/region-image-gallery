# Database Setup and Migrations Guide

## Database Configuration

### PostgreSQL Setup (Recommended)

#### Installation
```bash
# Windows
# Download from https://www.postgresql.org/download/windows/

# macOS
brew install postgresql@15

# Linux (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib
```

#### Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE region_image_gallery;

# Create test database
CREATE DATABASE region_image_gallery_test;

# Verify creation
\l
```

#### Create Database User (Optional)
```bash
# Create user with password
CREATE USER gallery_user WITH PASSWORD 'secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE region_image_gallery TO gallery_user;
```

### MySQL Setup (Alternative)

#### Installation
```bash
# Windows
# Download from https://dev.mysql.com/downloads/mysql/

# macOS
brew install mysql

# Linux (Ubuntu/Debian)
sudo apt-get install mysql-server
```

#### Create Database
```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE region_image_gallery;
CREATE DATABASE region_image_gallery_test;

# Create user (optional)
CREATE USER 'gallery_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON region_image_gallery.* TO 'gallery_user'@'localhost';
FLUSH PRIVILEGES;
```

## Environment Configuration

Create `.env` file in project root:

```env
# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=region_image_gallery
DB_USER=postgres
DB_PASSWORD=your_password
DB_DIALECT=postgres

# OR MySQL Configuration (uncomment if using MySQL)
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=region_image_gallery
# DB_USER=root
# DB_PASSWORD=your_password
# DB_DIALECT=mysql

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRY=7d

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Server Configuration
PORT=5000
NODE_ENV=development

# Image Processing
MAX_IMAGE_SIZE=5242880
MAX_IMAGES_PER_PROJECT=10
IMAGE_MAX_WIDTH=1080
IMAGE_QUALITY=75
```

## Database Schema

### Initial Setup

When the application starts, Sequelize automatically creates all tables with the following schema:

#### Regions Table
```sql
CREATE TABLE regions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  passwordHash VARCHAR(255) NOT NULL,
  region_id INTEGER NOT NULL REFERENCES regions(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Projects Table
```sql
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  region_id INTEGER NOT NULL REFERENCES regions(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Images Table
```sql
CREATE TABLE images (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id),
  file_url VARCHAR(500) NOT NULL,
  optimized_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Automatic Schema Sync

The application automatically creates and updates the schema on startup:

```javascript
// In src/app.js
await sequelize.sync({ alter: true });
```

The `{ alter: true }` option:
- Creates tables if they don't exist
- Modifies existing tables if schema changes
- **Warning**: Do not use in production without backup

## Seed Data

### Initial Regions

On first run, the application automatically seeds regions:

```javascript
const regions = await Region.findAll();
if (regions.length === 0) {
  await Region.bulkCreate([
    { name: 'South' },
    { name: 'East' },
    { name: 'West' },
    { name: 'North' },
  ]);
}
```

### Manual Seed Script

Create `scripts/seed.js`:

```javascript
require('dotenv').config();
const { sequelize, Region, User } = require('../src/models');
const { hashPassword } = require('../src/utils/password');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    await sequelize.sync({ alter: true });

    // Create regions
    const regions = await Region.bulkCreate([
      { name: 'South' },
      { name: 'East' },
      { name: 'West' },
      { name: 'North' },
    ]);

    // Create test user
    const passwordHash = await hashPassword('password123');
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash,
      region_id: regions[0].id,
    });

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
```

Run seed script:
```bash
node scripts/seed.js
```

## Database Backup and Restore

### PostgreSQL Backup

```bash
# Full database backup
pg_dump -U postgres region_image_gallery > backup.sql

# Compressed backup
pg_dump -U postgres region_image_gallery | gzip > backup.sql.gz

# Backup with verbose output
pg_dump -U postgres -v region_image_gallery > backup.sql
```

### PostgreSQL Restore

```bash
# Restore from SQL file
psql -U postgres region_image_gallery < backup.sql

# Restore from compressed file
gunzip < backup.sql.gz | psql -U postgres region_image_gallery
```

### MySQL Backup

```bash
# Full database backup
mysqldump -u root -p region_image_gallery > backup.sql

# Compressed backup
mysqldump -u root -p region_image_gallery | gzip > backup.sql.gz
```

### MySQL Restore

```bash
# Restore from SQL file
mysql -u root -p region_image_gallery < backup.sql

# Restore from compressed file
gunzip < backup.sql.gz | mysql -u root -p region_image_gallery
```

## Database Maintenance

### PostgreSQL Maintenance

```bash
# Connect to database
psql -U postgres region_image_gallery

# Check database size
SELECT pg_database.datname,
  pg_size_pretty(pg_database_size(pg_database.datname))
FROM pg_database;

# Analyze query performance
EXPLAIN ANALYZE SELECT * FROM users;

# Vacuum (cleanup)
VACUUM;

# Full vacuum
VACUUM FULL;
```

### MySQL Maintenance

```bash
# Connect to database
mysql -u root -p
USE region_image_gallery;

# Check table sizes
SELECT 
  table_name,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'region_image_gallery';

# Optimize tables
OPTIMIZE TABLE users, projects, images, regions;

# Analyze tables
ANALYZE TABLE users, projects, images, regions;
```

## Indexes for Performance

Add indexes to frequently queried columns:

### PostgreSQL

```sql
-- User lookups by email
CREATE INDEX idx_users_email ON users(email);

-- Project lookups by user_id
CREATE INDEX idx_projects_user_id ON projects(user_id);

-- Project lookups by region_id
CREATE INDEX idx_projects_region_id ON projects(region_id);

-- Image lookups by project_id
CREATE INDEX idx_images_project_id ON images(project_id);

-- Image creation date (for sorting)
CREATE INDEX idx_images_created ON images(created_at DESC);
```

### MySQL

```sql
-- User lookups by email
CREATE INDEX idx_users_email ON users(email);

-- Project lookups by user_id
CREATE INDEX idx_projects_user_id ON projects(user_id);

-- Project lookups by region_id
CREATE INDEX idx_projects_region_id ON projects(region_id);

-- Image lookups by project_id
CREATE INDEX idx_images_project_id ON images(project_id);

-- Image creation date (for sorting)
CREATE INDEX idx_images_created ON images(created_at DESC);
```

## Connection Pooling (Production)

For production, configure connection pooling:

```javascript
// src/config/sequelize.js
const sequelize = new Sequelize({
  // ... other config
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});
```

## Monitoring and Logging

### Enable SQL Logging

```javascript
// Set logging in development
const sequelize = new Sequelize({
  // ...
  logging: console.log, // Shows all SQL queries
});

// Or custom logger
logging: (sql) => {
  console.log(`[${new Date().toISOString()}] ${sql}`);
}
```

## Production Considerations

1. **Always backup before schema changes**
2. **Use read replicas for scaling**
3. **Enable SSL connections**
4. **Configure automatic backups**
5. **Monitor query performance**
6. **Use connection pooling**
7. **Set up alerting for disk space**
8. **Regular maintenance (VACUUM, OPTIMIZE)**

## Troubleshooting

### Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:5432
Solution: Verify database server is running
```

### Authentication Failed
```
Error: password authentication failed for user
Solution: Check DB_USER and DB_PASSWORD in .env
```

### Database Does Not Exist
```
Error: database does not exist
Solution: Create database using provided SQL
```

### Port Already in Use
```
Error: listen EADDRINUSE :::5432
Solution: Change DB_PORT in .env or kill process on port
```

## Additional Resources

- [Sequelize Documentation](https://sequelize.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Database Indexing Strategies](https://use-the-index-luke.com/)
