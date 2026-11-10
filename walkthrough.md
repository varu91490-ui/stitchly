# Walkthrough: ನನ್ನ ಟೈಲರಿಂಗ್ ಖಾತೆ (My Tailoring Account Book)

Production-ready, mobile-first web application designed specifically for a small tailoring business operated by a mother. The application simplifies business management through natural Kannada voice commands and manual inputs, maintaining accurate financial accounts, orders, customers, deliveries, and expenses without physical account books.

---

## 🚀 Key Modules Implemented

### 1. Relational Database Architecture (MySQL 8.0)
- **Local & Production**: Connected and initialized on **MySQL Server 8.0.46** with native `utf8mb4` Kannada Unicode character set and precision `DECIMAL(10, 2)` financial calculations.
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
