from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from dotenv import load_dotenv
import io
from datetime import datetime
from encryption import encrypt_file, decrypt_file
from utils import generate_secure_filename, validate_file_type
from config import DevelopmentConfig, ProductionConfig

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Use DevelopmentConfig for development
if os.getenv('FLASK_ENV') == 'development':
    app.config.from_object(DevelopmentConfig)
else:
    app.config.from_object(ProductionConfig)
CORS(app)

# Ensure directories exist
os.makedirs(app.config['STORAGE_FOLDER'], exist_ok=True)
os.makedirs(app.config['DECRYPTED_FOLDER'], exist_ok=True)

# Store file metadata (in production, use a database)
file_metadata = {}

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'message': 'Secure Exam Distribution System is running'
    })

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Upload and encrypt exam paper"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        password = request.form.get('password')
        subject = request.form.get('subject', 'Unknown')
        exam_date = request.form.get('exam_date', datetime.now().strftime('%Y-%m-%d'))
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not password:
            return jsonify({'error': 'Password is required'}), 400
        
        if not validate_file_type(file.filename):
            return jsonify({'error': 'Invalid file type. Only PDF, DOC, DOCX allowed'}), 400
        
        # Generate secure filename
        original_filename = file.filename
        secure_filename = generate_secure_filename(original_filename)
        
        # Read file content
        file_content = file.read()
        
        # Encrypt file
        encrypted_content = encrypt_file(file_content, password)
        
        # Save encrypted file
        encrypted_path = os.path.join(app.config['STORAGE_FOLDER'], secure_filename + '.enc')
        with open(encrypted_path, 'wb') as f:
            f.write(encrypted_content)
        
        # Store metadata
        file_id = secure_filename
        file_metadata[file_id] = {
            'original_filename': original_filename,
            'secure_filename': secure_filename,
            'subject': subject,
            'exam_date': exam_date,
            'upload_time': datetime.now().isoformat(),
            'file_size': len(file_content),
            'encrypted_path': encrypted_path
        }
        
        return jsonify({
            'message': 'File uploaded and encrypted successfully',
            'file_id': file_id,
            'original_filename': original_filename,
            'subject': subject,
            'exam_date': exam_date
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@app.route('/api/files', methods=['GET'])
def list_files():
    """List all uploaded files"""
    try:
        files_list = []
        for file_id, metadata in file_metadata.items():
            files_list.append({
                'file_id': file_id,
                'original_filename': metadata['original_filename'],
                'subject': metadata['subject'],
                'exam_date': metadata['exam_date'],
                'upload_time': metadata['upload_time'],
                'file_size': metadata['file_size']
            })
        
        return jsonify({
            'files': files_list,
            'total_files': len(files_list)
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to list files: {str(e)}'}), 500

@app.route('/api/download/<file_id>', methods=['POST'])
def download_file(file_id):
    """Download and decrypt exam paper"""
    try:
        password = request.json.get('password')
        
        if not password:
            return jsonify({'error': 'Password is required'}), 400
        
        if file_id not in file_metadata:
            return jsonify({'error': 'File not found'}), 404
        
        metadata = file_metadata[file_id]
        encrypted_path = metadata['encrypted_path']
        
        if not os.path.exists(encrypted_path):
            return jsonify({'error': 'Encrypted file not found on disk'}), 404
        
        # Read encrypted file
        with open(encrypted_path, 'rb') as f:
            encrypted_content = f.read()
        
        # Decrypt file
        try:
            decrypted_content = decrypt_file(encrypted_content, password)
        except Exception as decrypt_error:
            return jsonify({'error': 'Invalid password or corrupted file'}), 401
        
        # Create file-like object for download
        file_obj = io.BytesIO(decrypted_content)
        file_obj.seek(0)
        
        return send_file(
            file_obj,
            as_attachment=True,
            download_name=metadata['original_filename'],
            mimetype='application/octet-stream'
        )
        
    except Exception as e:
        return jsonify({'error': f'Download failed: {str(e)}'}), 500

@app.route('/api/delete/<file_id>', methods=['DELETE'])
def delete_file(file_id):
    """Delete encrypted file"""
    try:
        if file_id not in file_metadata:
            return jsonify({'error': 'File not found'}), 404
        
        metadata = file_metadata[file_id]
        encrypted_path = metadata['encrypted_path']
        
        # Delete encrypted file from disk
        if os.path.exists(encrypted_path):
            os.remove(encrypted_path)
        
        # Remove from metadata
        del file_metadata[file_id]
        
        return jsonify({'message': 'File deleted successfully'})
        
    except Exception as e:
        return jsonify({'error': f'Delete failed: {str(e)}'}), 500

@app.route('/api/verify/<file_id>', methods=['POST'])
def verify_file(file_id):
    """Verify file access without downloading"""
    try:
        password = request.json.get('password')
        
        if not password:
            return jsonify({'error': 'Password is required'}), 400
        
        if file_id not in file_metadata:
            return jsonify({'error': 'File not found'}), 404
        
        metadata = file_metadata[file_id]
        encrypted_path = metadata['encrypted_path']
        
        if not os.path.exists(encrypted_path):
            return jsonify({'error': 'Encrypted file not found on disk'}), 404
        
        # Read a small portion of encrypted file for verification
        with open(encrypted_path, 'rb') as f:
            encrypted_content = f.read()
        
        # Try to decrypt (this will raise an exception if password is wrong)
        try:
            decrypt_file(encrypted_content, password)
            return jsonify({
                'valid': True,
                'message': 'Password is correct',
                'file_info': {
                    'original_filename': metadata['original_filename'],
                    'subject': metadata['subject'],
                    'exam_date': metadata['exam_date'],
                    'file_size': metadata['file_size']
                }
            })
        except:
            return jsonify({'valid': False, 'message': 'Invalid password'}), 401
            
    except Exception as e:
        return jsonify({'error': f'Verification failed: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)