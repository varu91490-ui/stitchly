def test_create_customer(client, auth_headers):
    response = client.post(
        "/api/v1/customers/",
        headers=auth_headers,
        json={
            "name": "ಲಕ್ಷ್ಮಿ",
            "phone": "9876543210",
            "notes": "ರೆಗ್ಯುಲರ್ ಕಸ್ಟಮರ್"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "ಲಕ್ಷ್ಮಿ"
    assert data["phone"] == "9876543210"
    assert float(data["total_order_value"]) == 0.0
    assert float(data["outstanding_balance"]) == 0.0

def test_create_customer_without_phone(client, auth_headers):
    response = client.post(
        "/api/v1/customers/",
        headers=auth_headers,
        json={
            "name": "ಸುಧಾ",
            "phone": None
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "ಸುಧಾ"
    assert data["phone"] is None

def test_search_customer_by_kannada_name(client, auth_headers):
    client.post("/api/v1/customers/", headers=auth_headers, json={"name": "ಶಶಿಕಲಾ", "phone": "9999988888"})
    client.post("/api/v1/customers/", headers=auth_headers, json={"name": "ರಮ್ಯಾ", "phone": "7777766666"})

    # Search for ಶಶಿಕಲಾ
    res = client.get("/api/v1/customers/?q=ಶಶಿ", headers=auth_headers)
    assert res.status_code == 200
    items = res.json()
    assert len(items) == 1
    assert items[0]["name"] == "ಶಶಿಕಲಾ"
