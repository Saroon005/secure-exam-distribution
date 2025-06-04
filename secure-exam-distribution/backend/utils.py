import os
import uuid
import re
from datetime import datetime
import hashlib
from pathlib import Path

# Allowed file extensions for exam papers
ALLOWED_EXTENSIONS = {'.pdf', '.doc', '.docx', '.txt', '.rtf'}

# Maximum file size (50MB)
MAX_FILE_SIZE = 50 * 1024 * 1024

def generate_secure_filename(original_filename: str) -> str:
    """
    Generate a secure filename using UUID and timestamp
    Preserves original extension for file type identification
    """
    # Extract file extension
    file_ext = Path(original_filename).suffix.lower()
    
    # Generate unique identifier
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    unique_id = str(uuid.uuid4()).replace('-', '')[:8]
    
    # Create secure filename
    secure_name = f"exam_{timestamp}_{unique_id}"
    
    return secure_name

def validate_file_type(filename: str) -> bool:
    """Validate if file type is allowed for exam papers"""
    if not filename:
        return False
    
    file_ext = Path(filename).suffix.lower()
    return file_ext in ALLOWED_EXTENSIONS

def validate_file_size(file_size: int) -> bool:
    """Validate if file size is within allowed limits"""
    return 0 < file_size <= MAX_FILE_SIZE

def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename by removing dangerous characters
    Keeps only alphanumeric, dots, dashes, and underscores
    """
    # Remove path separators and dangerous characters
    filename = os.path.basename(filename)
    
    # Replace spaces with underscores
    filename = filename.replace(' ', '_')
    
    # Keep only safe characters
    filename = re.sub(r'[^a-zA-Z0-9._-]', '', filename)
    
    # Ensure filename is not empty and not too long
    if not filename or len(filename) > 255:
        filename = f"file_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    return filename

def generate_file_id(original_filename: str, content_hash: str = None) -> str:
    """
    Generate unique file ID based on filename and optional content hash
    """
    base_string = f"{original_filename}_{datetime.now().isoformat()}"
    
    if content_hash:
        base_string += f"_{content_hash[:8]}"
    
    # Generate SHA-256 hash of the base string
    file_id = hashlib.sha256(base_string.encode()).hexdigest()[:16]
    
    return file_id

def format_file_size(size_bytes: int) -> str:
    """Convert file size in bytes to human-readable format"""
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB", "TB"]
    i = 0
    
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1
    
    return f"{size_bytes:.1f} {size_names[i]}"

def validate_password_strength(password: str) -> tuple:
    """
    Validate password strength
    Returns: (is_valid: bool, message: str)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if len(password) > 128:
        return False, "Password must not exceed 128 characters"
    
    # Check for at least one uppercase letter
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    # Check for at least one lowercase letter
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    # Check for at least one digit
    if not re.search(r'\d', password):
        return False, "Password must contain at least one digit"
    
    # Check for at least one special character
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain at least one special character"
    
    return True, "Password is strong"

def clean_temp_files(temp_dir: str, max_age_hours: int = 24):
    """
    Clean temporary files older than specified hours
    """
    try:
        if not os.path.exists(temp_dir):
            return
        
        current_time = datetime.now().timestamp()
        max_age_seconds = max_age_hours * 3600
        
        for filename in os.listdir(temp_dir):
            file_path = os.path.join(temp_dir, filename)
            
            if os.path.isfile(file_path):
                file_age = current_time - os.path.getmtime(file_path)
                
                if file_age > max_age_seconds:
                    os.remove(file_path)
                    print(f"Cleaned temporary file: {filename}")
    
    except Exception as e:
        print(f"Error cleaning temporary files: {str(e)}")

def create_directory_structure(base_path: str, subdirs: list):
    """
    Create directory structure for the application
    """
    try:
        for subdir in subdirs:
            dir_path = os.path.join(base_path, subdir)
            os.makedirs(dir_path, exist_ok=True)
            
            # Create .gitkeep file to ensure directory is tracked in git
            gitkeep_path = os.path.join(dir_path, '.gitkeep')
            if not os.path.exists(gitkeep_path):
                with open(gitkeep_path, 'w') as f:
                    f.write('# This file ensures the directory is tracked in git\n')
    
    except Exception as e:
        print(f"Error creating directory structure: {str(e)}")

def log_file_operation(operation: str, filename: str, success: bool, error_msg: str = None):
    """
    Log file operations for audit trail
    In production, this should write to a proper logging system
    """
    timestamp = datetime.now().isoformat()
    status = "SUCCESS" if success else "FAILED"
    
    log_entry = f"[{timestamp}] {operation} - {filename} - {status}"
    
    if not success and error_msg:
        log_entry += f" - Error: {error_msg}"
    
    # For now, print to console. In production, use proper logging
    print(log_entry)
    
    # Optionally write to log file
    try:
        log_dir = "logs"
        os.makedirs(log_dir, exist_ok=True)
        
        log_file = os.path.join(log_dir, f"file_operations_{datetime.now().strftime('%Y-%m-%d')}.log")
        
        with open(log_file, 'a', encoding='utf-8') as f:
            f.write(log_entry + '\n')
    
    except Exception as e:
        print(f"Failed to write to log file: {str(e)}")

def get_file_mime_type(filename: str) -> str:
    """
    Get MIME type based on file extension
    """
    ext_to_mime = {
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.txt': 'text/plain',
        '.rtf': 'application/rtf'
    }
    
    file_ext = Path(filename).suffix.lower()
    return ext_to_mime.get(file_ext, 'application/octet-stream')

def is_safe_path(base_path: str, target_path: str) -> bool:
    """
    Check if target path is within base path (prevent directory traversal)
    """
    try:
        base_path = os.path.abspath(base_path)
        target_path = os.path.abspath(target_path)
        return target_path.startswith(base_path)
    except:
        return False