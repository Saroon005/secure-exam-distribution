import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent

class Config:
    """Base configuration class"""
    
    # Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    # Server Configuration
    HOST = os.environ.get('FLASK_HOST', '0.0.0.0')
    PORT = int(os.environ.get('FLASK_PORT', 5000))
    
    # File Storage Configuration
    STORAGE_FOLDER = os.path.join(BASE_DIR, 'storage', 'encrypted')
    DECRYPTED_FOLDER = os.path.join(BASE_DIR, 'storage', 'decrypted')
    LOG_FOLDER = os.path.join(BASE_DIR, 'logs')
    
    # File Upload Configuration
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_EXTENSIONS = {'.pdf', '.doc', '.docx', '.txt', '.rtf'}
    
    # Security Configuration
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = timedelta(minutes=30)
    
    # CORS Configuration
    CORS_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']
    
    # Encryption Configuration
    ENCRYPTION_ALGORITHM = 'AES-256-CBC'
    KEY_DERIVATION_ITERATIONS = 100000
    
    # Rate Limiting (requests per minute)
    RATE_LIMIT_UPLOAD = 10
    RATE_LIMIT_DOWNLOAD = 20
    RATE_LIMIT_GENERAL = 100
    
    # Cleanup Configuration
    TEMP_FILE_MAX_AGE_HOURS = 24
    AUTO_CLEANUP_INTERVAL_HOURS = 6
    
    # Logging Configuration
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    LOG_MAX_BYTES = 10 * 1024 * 1024  # 10MB
    LOG_BACKUP_COUNT = 5

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    SESSION_COOKIE_SECURE = False
    CORS_ORIGINS = ['*']  # Allow all origins in development
    TESTING = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    
    def __init__(self):
        super().__init__()
        if not os.environ.get('SECRET_KEY'):
            raise ValueError("SECRET_KEY environment variable must be set in production")
        self.SECRET_KEY = os.environ.get('SECRET_KEY')
    
    # Production-specific security headers
    FORCE_HTTPS = True
    SESSION_COOKIE_SAMESITE = 'Strict'
    
    # Stricter rate limiting in production
    RATE_LIMIT_UPLOAD = 5
    RATE_LIMIT_DOWNLOAD = 10
    RATE_LIMIT_GENERAL = 50

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True
    
    # Use temporary directories for testing
    STORAGE_FOLDER = '/tmp/exam_system_test/storage'
    DECRYPTED_FOLDER = '/tmp/exam_system_test/decrypted'
    LOG_FOLDER = '/tmp/exam_system_test/logs'
    
    # Disable CSRF for testing
    WTF_CSRF_ENABLED = False

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config():
    """Get configuration based on environment variable"""
    config_name = os.environ.get('FLASK_ENV', 'development')
    return config.get(config_name, config['default'])

# Application-specific constants
class AppConstants:
    """Application constants"""
    
    # System Information
    APP_NAME = "Secure Exam Distribution System"
    APP_VERSION = "1.0.0"
    APP_DESCRIPTION = "Cryptographically secure exam paper distribution system"
    
    # File Categories
    EXAM_PAPER_TYPES = {
        'question_paper': 'Question Paper',
        'answer_sheet': 'Answer Sheet Template',
        'marking_scheme': 'Marking Scheme',
        'instructions': 'Exam Instructions'
    }
    
    # Subjects (can be extended)
    SUBJECTS = [
        'Mathematics',
        'Physics',
        'Chemistry',
        'Biology',
        'Computer Science',
        'English',
        'History',
        'Geography',
        'Economics',
        'Other'
    ]
    
    # Exam Types
    EXAM_TYPES = [
        'Midterm',
        'Final',
        'Quiz',
        'Assignment',
        'Practice Test',
        'Mock Exam'
    ]
    
    # Security Messages
    SECURITY_MESSAGES = {
        'weak_password': 'Password does not meet security requirements',
        'file_too_large': 'File size exceeds maximum allowed limit',
        'invalid_file_type': 'File type not allowed for exam papers',
        'encryption_failed': 'Failed to encrypt file securely',
        'decryption_failed': 'Failed to decrypt file - check password',
        'file_not_found': 'Requested file not found',
        'access_denied': 'Access denied - insufficient permissions'
    }
    
    # Success Messages
    SUCCESS_MESSAGES = {
        'upload_success': 'Exam paper uploaded and encrypted successfully',
        'download_success': 'Exam paper downloaded and decrypted successfully',
        'delete_success': 'Exam paper deleted successfully',
        'verification_success': 'Password verification successful'
    }
    
    # Time Formats
    DATETIME_FORMAT = '%Y-%m-%d %H:%M:%S'
    DATE_FORMAT = '%Y-%m-%d'
    TIME_FORMAT = '%H:%M:%S'
    
    # API Response Codes
    HTTP_STATUS = {
        'OK': 200,
        'CREATED': 201,
        'BAD_REQUEST': 400,
        'UNAUTHORIZED': 401,
        'FORBIDDEN': 403,
        'NOT_FOUND': 404,
        'METHOD_NOT_ALLOWED': 405,
        'CONFLICT': 409,
        'PAYLOAD_TOO_LARGE': 413,
        'UNSUPPORTED_MEDIA_TYPE': 415,
        'RATE_LIMIT_EXCEEDED': 429,
        'INTERNAL_SERVER_ERROR': 500
    }