# Walkthrough: ನನ್ನ ಟೈಲರಿಂಗ್ ಖಾತೆ (My Tailoring Account Book)

Production-ready, mobile-first web application designed specifically for a small tailoring business operated by a mother. The application simplifies business management through natural Kannada voice commands and manual inputs, maintaining accurate financial accounts, orders, customers, deliveries, and expenses without physical account books.

---

## 🚀 Key Modules Implemented

### 1. Dual-Database Relational Architecture (MySQL Production + Oracle Local)
- **Local Environment**: Automatically connected and initialized on your local **Oracle SQL 21c XE** instance (`system/varudbms`) using SQLAlchemy ORM.
- **Production Environment**: Fully configured and ready for **Managed MySQL** (Render, Aiven, PlanetScale, TiDB) with Alembic database migrations.
- **Relational Tables**:
  - `users`: Shop owner credentials with native Bcrypt password hashing.
  - `customers`: Kannada Unicode customer directory with phone and notes.
  - `orders`: Relational orders supporting garment-wise pricing and combined single pricing.
  - `order_items`: Line items with quantities, unit prices, and line totals.
  - `payments`: Detailed payment transactions (Advance, Partial, Full, Correction) with non-destructive audit trail.
  - `expenses`: Shop expenses categorized in Kannada (electricity, rent, thread/materials, repairs).
  - `transaction_drafts`: State machine for multi-turn voice drafts.
  - `audit_logs`: Immutable audit trail for corrections and changes.

---

### 2. Intelligent Kannada Voice Assistant (`kannada_nlp.py` & `VoiceAssistantModal.tsx`)
- **Natural Voice Parsing**:
  - Handles customer names (e.g. *"ಲಕ್ಷ್ಮಿ ಎರಡು ಬ್ಲೌಸ್ ಕೊಟ್ಟಿದ್ದಾರೆ"* -> Customer: ಲಕ್ಷ್ಮಿ, Garment: ಬ್ಲೌಸ್, Quantity: 2).
  - Handles spoken numbers & values (ಒಂದು, ಎರಡು, ಮೂರು, ಐನೂರು, ಸಾವಿರ, etc.).
  - Handles total pricing (*"ಒಟ್ಟು ಸಾವಿರ ರೂಪಾಯಿ"* -> ₹1,000).
  - Handles advance payments (*"ಐನೂರು ರೂಪಾಯಿ ಅಡ್ವಾನ್ಸ್ ಕೊಟ್ಟಿದ್ದಾರೆ"* -> ₹500 advance).
  - Handles delivery dates (*"ಹದಿನೈದನೇ ತಾರೀಖಿಗೆ ಕೊಡಬೇಕು"*, *"ನಾಳೆ"*).
  - Incremental Draft Builder: user can speak in separate steps without restarting.
  - Ambiguity Resolution: detects multiple customers with the same name and prompts for selection.
  - Mandatory confirmation modal before committing financial data.
- **Voice Queries & Questions**:
  - *"ಇವತ್ತು ಎಷ್ಟು ಹಣ ಬಂತು?"* ➡️ Today's actual collected cash.
  - *"ಲಕ್ಷ್ಮಿ ಎಷ್ಟು ಹಣ ಕೊಡಬೇಕು?"* ➡️ Lakshmi's exact outstanding balance.
  - *"ಈ ತಿಂಗಳು ಎಷ್ಟು ಆದಾಯ ಬಂದಿದೆ?"* ➡️ Month's collected cash.
  - *"ನಾಳೆ ಯಾರ ಬಟ್ಟೆ ಕೊಡಬೇಕು?"* ➡️ Orders due tomorrow.
  - *"ಯಾವ ಆರ್ಡರ್ಗಳು ಇನ್ನೂ ಬಾಕಿ ಇವೆ?"* ➡️ Pending orders list.
  - Kannada Text-To-Speech (TTS) audio answers spoken back to the user!

---

### 3. Strict Financial Distinction
- **Order Value**: Quoted work value.
- **Money Received**: Actual cash or UPI collected.
- **Pending Balance**: Order value minus sum of valid payments.
- **Net Cash Movement**: Actual Collections minus Actual Expenses.
- No floating-point rounding issues; all financial operations use accurate Decimal types (`Decimal(10, 2)`).

---

### 4. Kannada-First Mobile Web UI & PWA (React + Vite + Tailwind)
- Entire user interface in clear, natural, everyday Kannada.
- High-contrast, large touch-friendly buttons optimized for mobile devices on a sewing counter.
- Floating Voice Mic button accessible from any screen with 1 tap.
- Progressive Web App (PWA) with `manifest.webmanifest`, service worker (`sw.js`), custom scissors icon, and Android home screen installability.
- Responsive pages:
  - **ಮುಖ್ಯ ಪುಟ (Dashboard)**: 4 core metrics, today's collections, outstanding balance, orders in progress, ready deliveries.
  - **ಗ್ರಾಹಕರು (Customers)**: Search by Kannada name or phone, view balances.
  - **ಆರ್ಡರ್‌ಗಳು (Orders)**: Filter by status pills, 1-tap status changes.
  - **ಹೊಸ ಆರ್ಡರ್ (New Order)**: Garment-wise vs. combined pricing toggle.
  - **ವಿತರಣೆ (Deliveries)**: Today, tomorrow, overdue, upcoming delivery tabs.
  - **ಖರ್ಚುಗಳು (Expenses)**: Shop expense tracker.
  - **ವರದಿಗಳು (Reports)**: Daily and monthly financial reports with print/PDF export.

---

## 🧪 Verification & Automated Test Results

### Backend Automated Test Suite (`pytest`)
All 12 automated unit and integration tests passed with 100% success:

```powershell
backend/tests/test_auth.py::test_register_user PASSED                    [  8%]
backend/tests/test_auth.py::test_login_user PASSED                       [ 16%]
backend/tests/test_auth.py::test_get_me PASSED                           [ 25%]
backend/tests/test_customers.py::test_create_customer PASSED             [ 33%]
backend/tests/test_customers.py::test_create_customer_without_phone PASSED [ 41%]
backend/tests/test_customers.py::test_search_customer_by_kannada_name PASSED [ 50%]
backend/tests/test_expenses_reports.py::test_expenses_and_dashboard_summary PASSED [ 58%]
backend/tests/test_kannada_voice_nlp.py::test_kannada_voice_nlp_multi_step_flow PASSED [ 66%]
backend/tests/test_orders_pricing.py::test_garment_wise_pricing_order PASSED [ 75%]
backend/tests/test_orders_pricing.py::test_combined_pricing_order PASSED [ 83%]
backend/tests/test_payments_balance.py::test_advance_and_partial_payments PASSED [ 91%]
backend/tests/test_payments_balance.py::test_payment_correction PASSED   [100%]

======================= 12 passed in 5.10s ========================
```

### Frontend Production Build (`npm run build`)
```
✓ 2106 modules transformed.
dist/index.html                   1.23 kB
dist/assets/index-C17gcE_8.css   27.90 kB
dist/assets/index-BsLPneo0.js   372.90 kB
✓ built in 1.22s
```

---

## 🏃 How to Run Locally

### 1. Start the Backend API
In a PowerShell terminal:
```powershell
python -m uvicorn app.main:app --app-dir backend --reload --port 8000
```
- API & Swagger UI: `http://localhost:8000/docs`

### 2. Start the Frontend Application
In a second PowerShell terminal:
```powershell
npm --prefix frontend run dev
```
- Web Application: `http://localhost:5173`
- Default login: `username: mother_tailor`, `password: tailor123` (or register any new user).
