def test_kannada_voice_nlp_multi_step_flow(client, auth_headers):
    # Step 1: Customer and Garment
    step1 = client.post(
        "/api/v1/voice/parse",
        headers=auth_headers,
        json={"transcript": "ಲಕ್ಷ್ಮಿ ಎರಡು ಬ್ಲೌಸ್ ಕೊಟ್ಟಿದ್ದಾರೆ"}
    ).json()
    assert step1["customer_name"] == "ಲಕ್ಷ್ಮಿ"
    assert len(step1["garments"]) == 1
    assert step1["garments"][0]["garment_name"] == "ಬ್ಲೌಸ್"
    assert step1["garments"][0]["quantity"] == 2
    draft_id = step1["draft_id"]

    # Step 2: Total amount
    step2 = client.post(
        "/api/v1/voice/parse",
        headers=auth_headers,
        json={"transcript": "ಒಟ್ಟು ಸಾವಿರ ರೂಪಾಯಿ", "draft_id": draft_id}
    ).json()
    assert float(step2["total_amount"]) == 1000.0

    # Step 3: Advance payment
    step3 = client.post(
        "/api/v1/voice/parse",
        headers=auth_headers,
        json={"transcript": "ಐನೂರು ರೂಪಾಯಿ ಅಡ್ವಾನ್ಸ್ ಕೊಟ್ಟಿದ್ದಾರೆ", "draft_id": draft_id}
    ).json()
    assert float(step3["advance_amount"]) == 500.0

    # Step 4: Delivery date
    step4 = client.post(
        "/api/v1/voice/parse",
        headers=auth_headers,
        json={"transcript": "ಹದಿನೈದನೇ ತಾರೀಖಿಗೆ ಕೊಡಬೇಕು", "draft_id": draft_id}
    ).json()
    assert step4["delivery_date"] is not None

    # Step 5: Confirm draft
    confirm_res = client.post(f"/api/v1/drafts/{draft_id}/confirm", headers=auth_headers)
    assert confirm_res.status_code == 200
    order_data = confirm_res.json()
    assert float(order_data["total_amount"]) == 1000.0
    assert float(order_data["paid_amount"]) == 500.0
    assert float(order_data["remaining_balance"]) == 500.0

    # Step 6: Test Voice Query "ಇವತ್ತು ಎಷ್ಟು ಹಣ ಬಂತು?"
    q1 = client.post(
        "/api/v1/voice/query",
        headers=auth_headers,
        json={"query": "ಇವತ್ತು ಎಷ್ಟು ಹಣ ಬಂತು?"}
    ).json()
    assert q1["intent"] == "TODAY_INCOME"
    assert "500" in q1["kannada_response"]

    # Step 7: Test Voice Query "ಲಕ್ಷ್ಮಿ ಎಷ್ಟು ಹಣ ಕೊಡಬೇಕು?"
    q2 = client.post(
        "/api/v1/voice/query",
        headers=auth_headers,
        json={"query": "ಲಕ್ಷ್ಮಿ ಎಷ್ಟು ಹಣ ಕೊಡಬೇಕು?"}
    ).json()
    assert q2["intent"] == "CUSTOMER_BALANCE"
    assert "500" in q2["kannada_response"]
