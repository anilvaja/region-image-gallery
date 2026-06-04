# Region-Based Image Gallery

A full-stack image gallery application with region-based access control, optimized image upload, AWS S3 storage support, and JWT authentication.

---

## 🚀 What this application does

- Register and authenticate users with an assigned region
- Create region-specific projects
- Upload images (max 10 images per project)
- Automatically optimize uploads using Sharp
- Store images in AWS S3
- View a gallery of all images across regions
- Protect project and image actions with JWT and region access checks

---

## 🧱 Technology Stack

### Backend
- Node.js + Express
- Sequelize ORM
- MySQL / MariaDB support via `mysql2`
- Image processing with `sharp`
- AWS S3 integration via `@aws-sdk/client-s3`
- Authentication with `jsonwebtoken`
- Password hashing with `bcrypt`

### Frontend
- React 18
- React Router v6
- Axios for API requests

---

## 📁 Repository Layout

```
region-image-gallery/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seeders/
│   ├── migrations/
│   ├── utils/
│   └── app.js
├── client/
│   ├── public/
│   └── src/
├── package.json
├── client/package.json
├── .sequelizerc
├── .env
└── README.md
```

---

## 🛠️ Prerequisites

- Node.js 14+ installed
- MySQL 8+ or compatible MySQL server
- AWS S3 account and bucket if using cloud image storage
- Optional: Docker for a local MySQL container

---

## 🔧 Backend Setup

### 1) Install dependencies

From the project root:

```bash
npm install
```

### 2) Create and configure `.env`

Create a `.env` file at the repository root and set values like:

```ini
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=region_image_gallery
DB_USER=academyuser
DB_PASSWORD=userpassword
DB_DIALECT=mysql

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRY=7d

AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

PORT=5001
NODE_ENV=development

MAX_IMAGE_SIZE=5242880
MAX_IMAGES_PER_PROJECT=10
IMAGE_MAX_WIDTH=1080
IMAGE_QUALITY=75
```

> Note: if you do not use AWS S3 immediately, you can leave the AWS values blank, but upload-related code may still expect a valid bucket.

### 3) Create the database

Run a MySQL command to ensure the database exists:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS region_image_gallery;"
```

If you are using a Docker MySQL container, make sure your `.env` host, port, user, and password match the container settings.

### 4) Run migrations and seed data

```bash
npm run db:init
```

This runs migrations and then seeds:
- default regions: South, East, West, North
- default user: `anilvaja.007@gmail.com` / `123`

### 5) Start the backend server

```bash
npm run dev
```

Then open `http://localhost:5001` to verify the backend is running.

---

## 🌐 Frontend Setup

### 1) Change to the client folder

```bash
cd client
```

### 2) Install frontend dependencies

```bash
npm install
```

### 3) Verify `react-scripts`

If `client/package.json` contains `react-scripts` version `^0.0.0`, update it to a supported version such as `^5.0.1`.

### 4) Optional API base URL configuration

Create `client/.env` if you want a custom API endpoint:

```bash
REACT_APP_API_URL=http://localhost:5001/api
```

The frontend defaults to `http://localhost:5001/api` if this value is not set.

### 5) Start the frontend

```bash
npm start
```

Then open `http://localhost:3000`.

---

## 📌 Useful Commands

### Backend
- `npm install`
- `npm run db:migrate`
- `npm run db:migrate:undo`
- `npm run db:seed`
- `npm run db:init`
- `npm run dev`
- `npm start`

### Frontend
- `cd client && npm install`
- `cd client && npm start`
- `cd client && npm run build`
- `cd client && npm test`

---

## 🧾 API Endpoints

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`

### Projects (JWT protected)
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:projectId`
- `DELETE /api/projects/:projectId`

### Images
- `GET /api/images/gallery`
- `POST /api/images/:projectId/upload` (JWT required)
- `GET /api/images/:projectId` (JWT required)
- `DELETE /api/images/:imageId/delete` (JWT required)

---

## 🗃️ Data Model Summary

### users
- `id`
- `name`
- `email`
- `password_hash`
- `region_id`
- `created_at`
- `updated_at`

### regions
- `id`
- `name`
- `created_at`
- `updated_at`

### projects
- `id`
- `title`
- `description`
- `user_id`
- `region_id`
- `created_at`
- `updated_at`

### images
- `id`
- `project_id`
- `title`
- `url`
- `s3_key`
- `created_at`
- `updated_at`

---

## 🚀 Deployment Guide

### Backend Deployment

1. Deploy the repository to your server or container.
2. Install backend dependencies: `npm install`
3. Configure production `.env` values.
4. Run database migrations:
   ```bash
   npm run db:migrate
   ```
5. Seed data when needed:
   ```bash
   npm run db:seed
   ```
6. Start the backend with PM2 or another process manager:
   ```bash
   npx pm2 start src/app.js --name region-gallery-api
   ```
7. Use Nginx or another reverse proxy to route traffic to the backend.

### Frontend Deployment

1. Build the client app:
   ```bash
   cd client
   npm run build
   ```
2. Serve the `client/build` output with a static server or Nginx.
3. Make sure `REACT_APP_API_URL` points to your backend API.

### Production Recommendations

- Keep `JWT_SECRET` secure.
- Use HTTPS.
- Keep `.env` out of version control.
- Ensure MySQL is secure and backed up.
- Validate AWS S3 bucket policies.

---

## ✅ Default Login
- Email: `anilvaja.007@gmail.com`
- Password: `123`

---

## 🚑 Troubleshooting

- If login fails, confirm the backend is running and accessible at `http://localhost:5000`.
- If the frontend fails to start, make sure `client/package.json` has a valid `react-scripts` package version.
- If migrations fail, verify your MySQL credentials and database state in `.env`.
- If S3 uploads fail, verify AWS credentials, region, and bucket name.

---

## 📌 Recommended Local Workflow

1. `npm install`
2. `npm run db:init`
3. `npm run dev`
4. `cd client && npm install`
5. `cd client && npm start`

---

## 💡 Notes

- Backend config is loaded from `src/config/database.js`.
- Sequelize CLI is configured via `.sequelizerc`.
- The frontend uses Axios with JWT headers.
- The backend supports MySQL through `mysql2`.
