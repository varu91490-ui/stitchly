def test_expenses_and_dashboard_summary(client, auth_headers):
    # 1. Create customer and order
    c_res = client.post("/api/v1/customers/", headers=auth_headers, json={"name": "ಮಾಲಾ"}).json()
    client.post(
        "/api/v1/orders/",
        headers=auth_headers,
        json={
            "customer_id": c_res["id"],
            "pricing_mode": "COMBINED",
            "total_amount": 2000.0,
            "advance_amount": 800.0
        }
    )

    # 2. Add an expense of ₹150 for electricity / thread
    client.post(
        "/api/v1/expenses/",
        headers=auth_headers,
        json={
            "category": "ದಾರ ಮತ್ತು ಸಾಮಗ್ರಿಗಳು",
            "description": "ರೀಲ್ ದಾರಗಳು ಮತ್ತು ಸೂಜಿಗಳು",
            "amount": 150.0
        }
    )

    # 3. Check Dashboard Summary
    dash = client.get("/api/v1/reports/dashboard", headers=auth_headers).json()
    assert float(dash["today_received"]) == 800.0
    assert float(dash["total_outstanding"]) == 1200.0
    assert float(dash["today_expenses"]) == 150.0
    # Net cash movement = payments received (800) - expenses (150) = 650
    assert float(dash["today_net_cash"]) == 650.0
