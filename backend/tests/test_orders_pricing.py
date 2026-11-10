def test_garment_wise_pricing_order(client, auth_headers):
    # Create customer
    c_res = client.post("/api/v1/customers/", headers=auth_headers, json={"name": "ಲಕ್ಷ್ಮಿ"})
    customer_id = c_res.json()["id"]

    # Garment-wise order: 2 Blouses @ ₹300 + 1 Churidar @ ₹400
    order_payload = {
        "customer_id": customer_id,
        "pricing_mode": "GARMENT_WISE",
        "items": [
            {"garment_name": "ಬ್ಲೌಸ್", "quantity": 2, "unit_price": 300, "line_total": 600},
            {"garment_name": "ಚೂಡಿದಾರ್", "quantity": 1, "unit_price": 400, "line_total": 400}
        ],
        "notes": "ಡಿಸೈನ್ ಬ್ಲೌಸ್"
    }
    res = client.post("/api/v1/orders/", headers=auth_headers, json=order_payload)
    assert res.status_code == 201
    data = res.json()
    assert float(data["total_amount"]) == 1000.0
    assert len(data["items"]) == 2
    assert data["pricing_mode"] == "GARMENT_WISE"

def test_combined_pricing_order(client, auth_headers):
    c_res = client.post("/api/v1/customers/", headers=auth_headers, json={"name": "ರಮ್ಯಾ"})
    customer_id = c_res.json()["id"]

    # Combined price order of ₹1500 with items having no individual prices
    order_payload = {
        "customer_id": customer_id,
        "pricing_mode": "COMBINED",
        "total_amount": 1500.0,
        "items": [
            {"garment_name": "ಗೌನ್", "quantity": 1, "unit_price": 0, "line_total": 0}
        ]
    }
    res = client.post("/api/v1/orders/", headers=auth_headers, json=order_payload)
    assert res.status_code == 201
    data = res.json()
    assert float(data["total_amount"]) == 1500.0
    assert data["pricing_mode"] == "COMBINED"
