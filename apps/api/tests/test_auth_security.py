import pytest
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_ip,
    hash_password,
    verify_password,
)


def test_argon2_password_hashing():
    pwd = "FarmerSecurePassword123!"
    hashed = hash_password(pwd)
    assert hashed != pwd
    assert hashed.startswith("$argon2")
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


def test_jwt_access_and_refresh_tokens():
    user_id = "12345678-1234-5678-1234-567812345678"
    access_token = create_access_token(user_id)
    assert isinstance(access_token, str)
    decoded_access = decode_token(access_token)
    assert decoded_access is not None
    assert decoded_access["sub"] == user_id
    assert decoded_access["type"] == "access"

    refresh_token = create_refresh_token(user_id)
    assert isinstance(refresh_token, str)
    decoded_refresh = decode_token(refresh_token)
    assert decoded_refresh is not None
    assert decoded_refresh["sub"] == user_id
    assert decoded_refresh["type"] == "refresh"


def test_ip_hashing():
    ip = "192.168.1.100"
    digest1 = hash_ip(ip)
    digest2 = hash_ip(ip)
    assert len(digest1) == 64  # SHA-256 hex string
    assert digest1 == digest2
    assert hash_ip("192.168.1.101") != digest1
