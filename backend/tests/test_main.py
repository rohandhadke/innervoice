import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db

# use SQLite in-memory for CI — no MySQL needed
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "InnerVoice API is running"}

def test_get_posts_empty():
    response = client.get("/api/posts/")
    assert response.status_code == 200
    assert response.json() == []

def test_register_user():
    response = client.post("/api/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123",
        "full_name": "Test User"
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data

def test_register_duplicate_email():
    client.post("/api/auth/register", json={
        "username": "testuser1",
        "email": "duplicate@example.com",
        "password": "testpassword123"
    })
    response = client.post("/api/auth/register", json={
        "username": "testuser2",
        "email": "duplicate@example.com",
        "password": "testpassword123"
    })
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]

def test_login_user():
    client.post("/api/auth/register", json={
        "username": "loginuser",
        "email": "login@example.com",
        "password": "testpassword123"
    })
    response = client.post("/api/auth/login", json={
        "email": "login@example.com",
        "password": "testpassword123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_wrong_password():
    client.post("/api/auth/register", json={
        "username": "wrongpassuser",
        "email": "wrong@example.com",
        "password": "correctpassword"
    })
    response = client.post("/api/auth/login", json={
        "email": "wrong@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_create_anonymous_post():
    response = client.post("/api/posts/", json={
        "content": "This is a test anonymous post",
        "is_anonymous": True,
        "visibility": "public"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["is_anonymous"] == True
    assert data["user_id"] is None

def test_get_posts_after_create():
    client.post("/api/posts/", json={
        "content": "Hello world post",
        "is_anonymous": True,
        "visibility": "public"
    })
    response = client.get("/api/posts/")
    assert response.status_code == 200
    assert len(response.json()) == 1