# ನನ್ನ ಟೈಲರಿಂಗ್ ಖಾತೆ (My Tailoring Account Book)

> **ಕನ್ನಡ ಧ್ವನಿ ಆಧಾರಿತ ಟೈಲರಿಂಗ್ ವ್ಯಾಪಾರ ಮತ್ತು ಲೆಕ್ಕಪತ್ರ ನಿರ್ವಹಣಾ ವ್ಯವಸ್ಥೆ**  
> *A Production-Ready, Mobile-First Tailoring Business & Financial Management System with Natural Kannada Voice Recognition.*

---

## 🌟 ವೈಶಿಷ್ಟ್ಯಗಳು (Key Features)

1. **ಸಂಪೂರ್ಣ ಕನ್ನಡ ಇಂಟರ್ಫೇಸ್ (Full Kannada User Experience)**:
   - Dashboard, orders, customers, reports, delivery tracker, errors, receipts in natural, simple Kannada.
   - Large touch buttons designed specifically for mobile screens on a tailoring cutting table.

2. **ಕನ್ನಡ ಧ್ವನಿ ಸಹಾಯಕ (Intelligent Kannada Voice Assistant)**:
   - Speak naturally: *"ಲಕ್ಷ್ಮಿ ಎರಡು ಬ್ಲೌಸ್ ಕೊಟ್ಟಿದ್ದಾರೆ"*, *"ಒಟ್ಟು ಸಾವಿರ ರೂಪಾಯಿ"*, *"ಐನೂರು ರೂಪಾಯಿ ಅಡ್ವಾನ್ಸ್"*, *"ಹದಿನೈದನೇ ತಾರೀಖಿಗೆ ಕೊಡಬೇಕು"*.
   - Automatically parses customer names, garments, quantities, total prices, advance payments, and delivery dates.
   - Smart multi-step draft transaction system that allows speaking information in separate sentences.
   - Clarification dialogs when customer names are ambiguous.
   - Mandatory verification modal before committing financial data.

3. **ಧ್ವನಿ ಆಧಾರಿತ ಪ್ರಶ್ನೋತ್ತರಗಳು (Voice-Based Queries)**:
   - *"ಇವತ್ತು ಎಷ್ಟು ಹಣ ಬಂತು?"* (Today's actual cash received)
   - *"ಲಕ್ಷ್ಮಿ ಎಷ್ಟು ಹಣ ಕೊಡಬೇಕು?"* (Lakshmi's pending balance)
   - *"ಈ ತಿಂಗಳು ಎಷ್ಟು ಆದಾಯ ಬಂದಿದೆ?"* (Monthly collections)
   - *"ನಾಳೆ ಯಾರ ಬಟ್ಟೆ ಕೊಡಬೇಕು?"* (Tomorrow's due deliveries)
   - *"ಯಾವ ಆರ್ಡರ್ಗಳು ಇನ್ನೂ ಬಾಕಿ ಇವೆ?"* (Pending orders)

4. **ನಿಖರವಾದ ಹಣಕಾಸು ಲೆಕ್ಕಪತ್ರ (Accurate Financial Accounting)**:
   - Strict distinction: **Order Value ≠ Money Received**.
   - Multiple partial payments, advance tracking, and real-time outstanding balances.
   - Shop expense tracking (rent, electricity, threads, maintenance).
   - Net cash movement calculation = Collections minus Expenses.
   - Non-destructive audit logs for financial corrections.

5. **ಪ್ರೋಗ್ರೆಸಿವ್ ವೆಬ್ ಆ್ಯಪ್ (PWA & Android Support)**:
   - Installable on mobile phone home screen.
   - Fast, responsive, works seamlessly on Android browsers.

---

## 🛠️ ತಂತ್ರಜ್ಞಾನಗಳು (Technology Stack)

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, React Router.
- **Backend**: Python 3.11, FastAPI, Pydantic v2, SQLAlchemy ORM, Alembic, Uvicorn.
- **Database**: MySQL 8.0 (Local MySQL Server & Cloud Managed MySQL).
- **Authentication**: JWT, Argon2/Bcrypt password hashing, ownership checks.
- **Voice Recognition**: Dual-layer architecture (Web Speech API `kn-IN` + server-side audio fallback & Kannada NLP parser).

---

## 🚀 ತ್ವರಿತ ಆರಂಭ (Quickstart)

### 1. Backend Setup
```powershell
cd backend
python -m pip install -r requirements.txt
cp ../.env.example .env
python -m app.main
```
Backend API and Swagger UI will be live at `http://localhost:8000/docs`.

### 2. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```
Frontend will be live at `http://localhost:5173`.

---

## 📜 Documentation
- [Database Design](docs/DATABASE_DESIGN.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Kannada User Guide](docs/USER_GUIDE_KANNADA.md)
