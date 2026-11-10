# Deployment Guide: ನನ್ನ ಟೈಲರಿಂಗ್ ಖಾತೆ (Production Setup)

This guide provides end-to-end instructions for deploying the production system:
- **Frontend**: Vercel (React + Vite PWA)
- **Backend**: Render (Python FastAPI)
- **Database**: Managed MySQL (Aiven, PlanetScale, TiDB Cloud, or Render MySQL)

---

## 1. Managed MySQL Database Setup

1. Sign up for a free managed MySQL instance on [Aiven.io](https://aiven.io) or [TiDB Cloud](https://tidbcloud.com) or [Render PostgreSQL/MySQL](https://render.com).
2. Create a new service named `stitchly-mysql` (MySQL 8.0).
3. Copy the database connection URI:
   ```
   mysql+pymysql://<user>:<password>@<host>:<port>/stitchly_db?charset=utf8mb4&ssl_ca=/path/to/ca.pem
   ```
4. Verify connectivity using MySQL CLI or Workbench:
   ```bash
   mysql -h <host> -P <port> -u <user> -p stitchly_db
   ```

---

## 2. Backend Deployment on Render

1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Set the following build and start configurations:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Configure Environment Variables in Render:
   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | `mysql+pymysql://<user>:<password>@<host>:<port>/stitchly_db?charset=utf8mb4` |
   | `SECRET_KEY` | *(Generate a 64-character random string)* |
   | `ALGORITHM` | `HS256` |
   | `ACCESS_TOKEN_EXPIRE_MINUTES` | `43200` |
   | `ENVIRONMENT` | `production` |
   | `CORS_ORIGINS` | `https://your-app.vercel.app,http://localhost:5173` |

6. Click **Deploy Web Service**.
7. Once deployed, note your backend URL: e.g. `https://stitchly-backend.onrender.com`.

---

## 3. Frontend Deployment on Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Set Project Configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Configure Environment Variables in Vercel:
   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | `https://stitchly-backend.onrender.com/api/v1` |

6. Click **Deploy**.
7. Once finished, visit your Vercel URL on an Android device:
   - Tap Chrome menu (`⋮`) -> **"Add to Home Screen"** / **"ಆ್ಯಪ್ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ"**.
   - The app will install as a native PWA on the home screen!

---

## 4. Database Migrations (Alembic)

To run migrations against the production MySQL database:
```bash
cd backend
alembic upgrade head
```

To generate a new migration after schema changes:
```bash
alembic revision --autogenerate -m "add_new_columns"
alembic upgrade head
```

---

## 5. Database Backup and Restore Procedures

### Automated Backup Script (Windows & Linux)
```bash
# Export / Backup MySQL database
mysqldump -h <host> -P <port> -u <user> -p stitchly_db > backup_$(date +%Y%m%d).sql

# Restore from Backup
mysql -h <host> -P <port> -u <user> -p stitchly_db < backup_20261110.sql
```

For managed cloud databases (such as Aiven or Render), automated daily backups with Point-In-Time Recovery (PITR) are enabled by default in the cloud provider console.
