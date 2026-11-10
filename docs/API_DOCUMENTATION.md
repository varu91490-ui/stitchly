# API Documentation: ನನ್ನ ಟೈಲರಿಂಗ್ ಖಾತೆ (REST API v1)

All API endpoints are prefixed with `/api/v1`. Authentication uses the Bearer JWT token in the `Authorization` header (`Authorization: Bearer <token>`).

Interactive OpenAPI documentation is live at `http://localhost:8000/docs`.

---

## 1. Authentication (`/api/v1/auth`)

### `POST /auth/register`
Creates a new tailoring shop user.
- **Request Body**:
```json
{
  "name": "ಲಕ್ಷ್ಮಿ ಅಮ್ಮ",
  "username": "lakshmi_tailors",
  "password": "securepassword123"
}
```
- **Response**: `201 Created`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user_id": 1,
  "name": "ಲಕ್ಷ್ಮಿ ಅಮ್ಮ",
  "username": "lakshmi_tailors"
}
```

### `POST /auth/login`
OAuth2 password request form (`username`, `password`).
- **Response**: `200 OK` (Returns access token).

### `GET /auth/me`
Retrieves current authenticated user profile.

---

## 2. Customer Management (`/api/v1/customers`)

### `GET /customers/`
Lists customers with calculated financial summaries (total order value, total payments, outstanding balance).
- **Query Params**: `q` (name or phone), `skip`, `limit`
- **Response**: `200 OK`
```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "ಲಕ್ಷ್ಮಿ",
    "phone": "9876543210",
    "notes": "ರೆಗ್ಯುಲರ್ ಕಸ್ಟಮರ್",
    "created_at": "2026-11-10T12:00:00Z",
    "updated_at": "2026-11-10T12:00:00Z",
    "total_order_value": 1000.0,
    "total_paid": 500.0,
    "outstanding_balance": 500.0,
    "orders_count": 1
  }
]
```

### `POST /customers/`
Creates a new customer.
- **Request Body**:
```json
{
  "name": "ರಮ್ಯಾ",
  "phone": "9988776655",
  "notes": "ಚೂಡಿದಾರ್ ಡಿಸೈನರ್"
}
```

### `GET /customers/{customer_id}`
Returns customer details.

### `PUT /customers/{customer_id}`
Updates customer information.

---

## 3. Order Management (`/api/v1/orders`)

### `POST /orders/`
Creates a new order with garments, pricing, and optional advance payment.
- **Garment-Wise Pricing Example**:
```json
{
  "customer_id": 1,
  "pricing_mode": "GARMENT_WISE",
  "items": [
    { "garment_name": "ಬ್ಲೌಸ್", "quantity": 2, "unit_price": 300, "line_total": 600 },
    { "garment_name": "ಚೂಡಿದಾರ್", "quantity": 1, "unit_price": 400, "line_total": 400 }
  ],
  "expected_delivery_date": "2026-11-15T18:00:00Z",
  "advance_amount": 500.0,
  "payment_method": "CASH",
  "notes": "ಡಿಸೈನ್ ಕುತ್ತಿಗೆ"
}
```
- **Combined Pricing Example**:
```json
{
  "customer_id": 1,
  "pricing_mode": "COMBINED",
  "total_amount": 1200.0,
  "items": [
    { "garment_name": "ಗೌನ್", "quantity": 1, "unit_price": 0, "line_total": 0 }
  ],
  "expected_delivery_date": "2026-11-20T18:00:00Z"
}
```

### `GET /orders/`
Lists orders.
- **Query Params**: `status` (`NEW`, `IN_PROGRESS`, `READY`, `DELIVERED`, `CANCELLED`), `customer_id`, `delivery_filter` (`today`, `tomorrow`, `overdue`, `upcoming`), `skip`, `limit`.

### `PUT /orders/{order_id}`
Updates order status, delivery date, or notes.
```json
{
  "status": "READY"
}
```

---

## 4. Payments (`/api/v1/payments`)

### `POST /payments/`
Records a payment (advance, partial, full, delivery).
```json
{
  "customer_id": 1,
  "order_id": 1,
  "amount": 500.0,
  "payment_method": "UPI",
  "payment_type": "FULL",
  "notes": "ಬಾಕಿ ಹಣ ಪಾವತಿಸಲಾಗಿದೆ"
}
```

### `POST /payments/{payment_id}/correct`
Corrects an existing payment amount with mandatory audit trail explanation.
```json
{
  "corrected_amount": 550.0,
  "reason": "ತಪ್ಪಾಗಿ ₹500 ನಮೂದಿಸಲಾಗಿತ್ತು"
}
```

---

## 5. Expenses (`/api/v1/expenses`)

### `POST /expenses/`
Records shop operating expense.
```json
{
  "category": "ದಾರ ಮತ್ತು ಸಾಮಗ್ರಿಗಳು",
  "amount": 250.0,
  "description": "5 ರೀಲ್ ದಾರ ಮತ್ತು ಸೂಜಿಗಳು"
}
```

### `GET /expenses/summary`
Returns category breakdown and total expense for month/year.

---

## 6. Reports & Dashboards (`/api/v1/reports`)

### `GET /reports/dashboard`
Returns 4 key operational metrics:
- `today_received`: Total collected cash today.
- `total_outstanding`: Total money owed across all customers.
- `orders_in_progress`: In-progress order count.
- `orders_ready`: Ready deliveries count.
- `today_net_cash`: Received minus Expenses.

### `GET /reports/daily?report_date=YYYY-MM-DD`
Daily financial accounting report.

### `GET /reports/monthly?year=YYYY&month=MM`
Monthly revenue, collections, outstanding, expenses, and net cash movement.

---

## 7. Kannada Voice Assistant (`/api/v1/voice`)

### `POST /voice/parse`
Parses natural Kannada and mixed Kannada-English speech. Automatically merges into draft context.
- **Request Body**:
```json
{
  "transcript": "ಲಕ್ಷ್ಮಿ ಎರಡು ಬ್ಲೌಸ್ ಕೊಟ್ಟಿದ್ದಾರೆ ಒಟ್ಟು ಸಾವಿರ ರೂಪಾಯಿ ಐನೂರು ಅಡ್ವಾನ್ಸ್",
  "draft_id": null
}
```
- **Response**:
```json
{
  "original_transcript": "...",
  "intent": "NEW_ORDER",
  "customer_name": "ಲಕ್ಷ್ಮಿ",
  "customer_id": 1,
  "matched_customers": [],
  "is_ambiguous_customer": false,
  "garments": [
    { "garment_name": "ಬ್ಲೌಸ್", "quantity": 2, "unit_price": null, "line_total": null }
  ],
  "total_amount": 1000.0,
  "advance_amount": 500.0,
  "delivery_date": null,
  "missing_fields": ["ವಿತರಣಾ ದಿನಾಂಕ (Delivery Date)"],
  "draft_id": 1,
  "kannada_summary": "ಗ್ರಾಹಕರು: ಲಕ್ಷ್ಮಿ | ಬಟ್ಟೆಗಳು: ಬ್ಲೌಸ್ (2) | ಒಟ್ಟು ಮೊತ್ತ: ₹1000.0 | ಅಡ್ವಾನ್ಸ್: ₹500.0"
}
```

### `POST /voice/query`
Natural language voice queries querying live DB records.
- Examples:
  - `"ಇವತ್ತು ಎಷ್ಟು ಹಣ ಬಂತು?"` -> Returns today's collections.
  - `"ಲಕ್ಷ್ಮಿ ಎಷ್ಟು ಹಣ ಕೊಡಬೇಕು?"` -> Returns Lakshmi's balance.
  - `"ನಾಳೆ ಯಾರ ಬಟ್ಟೆ ಕೊಡಬೇಕು?"` -> Returns tomorrow's due deliveries.
  - `"ಯಾವ ಆರ್ಡರ್ಗಳು ಇನ್ನೂ ಬಾಕಿ ಇವೆ?"` -> Returns pending orders.
