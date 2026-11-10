def test_advance_and_partial_payments(client, auth_headers):
    # 1. Create customer
    c_res = client.post("/api/v1/customers/", headers=auth_headers, json={"name": "ಸುಧಾ"})
    cust_id = c_res.json()["id"]

    # 2. Create order of ₹1500 with ₹500 advance
    order_payload = {
        "customer_id": cust_id,
        "pricing_mode": "COMBINED",
        "total_amount": 1500.0,
        "advance_amount": 500.0,
        "payment_method": "CASH"
    }
    o_res = client.post("/api/v1/orders/", headers=auth_headers, json=order_payload)
    order_id = o_res.json()["id"]

    # Verify initial balance
    check_order = client.get(f"/api/v1/orders/{order_id}", headers=auth_headers).json()
    assert float(check_order["paid_amount"]) == 500.0
    assert float(check_order["remaining_balance"]) == 1000.0

    # 3. Second payment of ₹300
    p2 = client.post(
        "/api/v1/payments/",
        headers=auth_headers,
        json={
            "customer_id": cust_id,
            "order_id": order_id,
            "amount": 300.0,
            "payment_method": "UPI",
            "payment_type": "PARTIAL"
        }
    )
    assert p2.status_code == 201

    check_order2 = client.get(f"/api/v1/orders/{order_id}", headers=auth_headers).json()
    assert float(check_order2["paid_amount"]) == 800.0
    assert float(check_order2["remaining_balance"]) == 700.0

    # 4. Third payment of ₹700 (Clears order)
    p3 = client.post(
        "/api/v1/payments/",
        headers=auth_headers,
        json={
            "customer_id": cust_id,
            "order_id": order_id,
            "amount": 700.0,
            "payment_method": "CASH",
            "payment_type": "FULL"
        }
    )
    assert p3.status_code == 201

    check_order3 = client.get(f"/api/v1/orders/{order_id}", headers=auth_headers).json()
    assert float(check_order3["paid_amount"]) == 1500.0
    assert float(check_order3["remaining_balance"]) == 0.0

def test_payment_correction(client, auth_headers):
    c_res = client.post("/api/v1/customers/", headers=auth_headers, json={"name": "ಕವಿತಾ"})
    cust_id = c_res.json()["id"]

    p = client.post(
        "/api/v1/payments/",
        headers=auth_headers,
        json={"customer_id": cust_id, "amount": 200.0, "payment_method": "CASH"}
    ).json()

    # Correct payment from 200 to 250
    corr = client.post(
        f"/api/v1/payments/{p['id']}/correct",
        headers=auth_headers,
        json={"corrected_amount": 250.0, "reason": "ತಪ್ಪಾಗಿ ₹200 ಬರೆಯಲಾಗಿತ್ತು, ನಿಜವಾಗಿ ₹250 ಕೊಟ್ಟಿದ್ದಾರೆ"}
    )
    assert corr.status_code == 200
    assert float(corr.json()["amount"]) == 250.0
    assert corr.json()["payment_type"] == "CORRECTION"
