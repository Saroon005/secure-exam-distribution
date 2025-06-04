from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes, padding
from cryptography.hazmat.backends import default_backend
import os
import base64

def derive_key(password: str, salt: bytes) -> bytes:
    """Derive encryption key from password using PBKDF2"""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,  # 256 bits for AES-256
        salt=salt,
        iterations=100000,  # High iteration count for security
        backend=default_backend()
    )
    return kdf.derive(password.encode('utf-8'))

def encrypt_file(file_content: bytes, password: str) -> bytes:
    """
    Encrypt file content using AES-256-CBC
    Returns encrypted content with salt and IV prepended
    """
    try:
        # Generate random salt and IV
        salt = os.urandom(16)  # 128-bit salt
        iv = os.urandom(16)    # 128-bit IV for AES
        
        # Derive key from password
        key = derive_key(password, salt)
        
        # Create cipher
        cipher = Cipher(
            algorithms.AES(key),
            modes.CBC(iv),
            backend=default_backend()
        )
        encryptor = cipher.encryptor()
        
        # Pad data to be multiple of 16 bytes (AES block size)
        padder = padding.PKCS7(128).padder()
        padded_data = padder.update(file_content)
        padded_data += padder.finalize()
        
        # Encrypt the data
        encrypted_data = encryptor.update(padded_data) + encryptor.finalize()
        
        # Combine salt + IV + encrypted_data
        # Format: [16 bytes salt][16 bytes IV][encrypted data]
        result = salt + iv + encrypted_data
        
        return result
        
    except Exception as e:
        raise Exception(f"Encryption failed: {str(e)}")

def decrypt_file(encrypted_content: bytes, password: str) -> bytes:
    """
    Decrypt file content using AES-256-CBC
    Expects encrypted content with salt and IV prepended
    """
    try:
        # Extract salt, IV, and encrypted data
        if len(encrypted_content) < 32:  # At least salt + IV
            raise ValueError("Invalid encrypted file format")
        
        salt = encrypted_content[:16]
        iv = encrypted_content[16:32]
        encrypted_data = encrypted_content[32:]
        
        # Derive key from password
        key = derive_key(password, salt)
        
        # Create cipher
        cipher = Cipher(
            algorithms.AES(key),
            modes.CBC(iv),
            backend=default_backend()
        )
        decryptor = cipher.decryptor()
        
        # Decrypt the data
        padded_data = decryptor.update(encrypted_data) + decryptor.finalize()
        
        # Remove padding
        unpadder = padding.PKCS7(128).unpadder()
        file_content = unpadder.update(padded_data)
        file_content += unpadder.finalize()
        
        return file_content
        
    except Exception as e:
        raise Exception(f"Decryption failed: {str(e)}")

def generate_file_hash(file_content: bytes) -> str:
    """Generate SHA-256 hash of file content for integrity verification"""
    digest = hashes.Hash(hashes.SHA256(), backend=default_backend())
    digest.update(file_content)
    return base64.b64encode(digest.finalize()).decode('utf-8')

def verify_file_integrity(file_content: bytes, expected_hash: str) -> bool:
    """Verify file integrity using SHA-256 hash"""
    actual_hash = generate_file_hash(file_content)
    return actual_hash == expected_hash

# Advanced encryption functions for future use

def encrypt_with_integrity(file_content: bytes, password: str) -> tuple:
    """
    Encrypt file and return encrypted content with integrity hash
    Returns: (encrypted_content, content_hash)
    """
    content_hash = generate_file_hash(file_content)
    encrypted_content = encrypt_file(file_content, password)
    return encrypted_content, content_hash

def decrypt_with_verification(encrypted_content: bytes, password: str, expected_hash: str) -> bytes:
    """
    Decrypt file and verify integrity
    Raises exception if decryption fails or integrity check fails
    """
    decrypted_content = decrypt_file(encrypted_content, password)
    
    if not verify_file_integrity(decrypted_content, expected_hash):
        raise Exception("File integrity verification failed")
    
    return decrypted_content

# Key management utilities

def generate_master_key() -> str:
    """Generate a strong master key for additional security layers"""
    return base64.b64encode(os.urandom(32)).decode('utf-8')

def derive_session_key(master_key: str, session_id: str) -> bytes:
    """Derive session-specific key from master key"""
    salt = session_id.encode('utf-8')[:16].ljust(16, b'\0')  # Ensure 16 bytes
    return derive_key(master_key, salt)