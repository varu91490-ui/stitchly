def test_register_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "ಲಕ್ಷ್ಮಿ ಅಮ್ಮ",
            "username": "lakshmi_tailors",
            "password": "securepassword123"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["username"] == "lakshmi_tailors"
    assert data["name"] == "ಲಕ್ಷ್ಮಿ ಅಮ್ಮ"

def test_login_user(client, test_user):
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "mother_tailor",
            "password": "testpass123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data

def test_get_me(client, auth_headers):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "mother_tailor"
