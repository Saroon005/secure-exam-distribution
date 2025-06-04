import React, { useState, useRef } from 'react';
import { Upload, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { apiService, fileUtils } from '../api';

const UploadForm = ({ onUploadSuccess, showNotification }) => {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [subject, setSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const fileInputRef = useRef(null);

  const subjects = [
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
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    // Validate file type
    if (!fileUtils.validateFileType(selectedFile.name)) {
      showNotification('Invalid file type. Only PDF, DOC, DOCX, TXT, RTF files are allowed.', 'error');
      return;
    }

    // Validate file size
    if (!fileUtils.validateFileSize(selectedFile.size)) {
      showNotification('File size exceeds 50MB limit.', 'error');
      return;
    }

    setFile(selectedFile);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const checkPasswordStrength = (pwd) => {
    if (pwd.length < 8) return 'weak';
    if (pwd.length < 12) return 'medium';
    
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    
    const criteria = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (criteria >= 4 && pwd.length >= 12) return 'strong';
    if (criteria >= 3) return 'medium';
    return 'weak';
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'strong': return 'text-green-600 border-green-300';
      case 'medium': return 'text-yellow-600 border-yellow-300';
      case 'weak': return 'text-red-600 border-red-300';
      default: return 'text-gray-600 border-gray-300';
    }
  };

  const getPasswordStrengthBg = () => {
    switch (passwordStrength) {
      case 'strong': return 'bg-green-100';
      case 'medium': return 'bg-yellow-100';
      case 'weak': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file || !password || !subject) {
      showNotification('Please fill in all required fields.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showNotification('Passwords do not match.', 'error');
      return;
    }

    if (passwordStrength === 'weak') {
      showNotification('Please use a stronger password for better security.', 'warning');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('password', password);
      formData.append('subject', subject);
      formData.append('exam_date', examDate || new Date().toISOString().split('T')[0]);

      const response = await apiService.uploadFile(formData, setUploadProgress);
      
      // Reset form
      setFile(null);
      setPassword('');
      setConfirmPassword('');
      setSubject('');
      setExamDate('');
      setPasswordStrength('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      onUploadSuccess(response);
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-indigo-400 bg-indigo-50'
            : file
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.rtf"
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        <div className="space-y-4">
          {file ? (
            <div className="flex items-center justify-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{fileUtils.formatFileSize(file.size)}</p>
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Drag & drop your exam paper here
                </p>
                <p className="text-sm text-gray-500">
                  or click to browse files
                </p>
              </div>
            </>
          )}
          
          <p className="text-xs text-gray-400">
            Supported formats: PDF, DOC, DOCX, TXT, RTF (Max 50MB)
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject *
          </label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
            disabled={uploading}
          >
            <option value="">Select Subject</option>
            {subjects.map((subj) => (
              <option key={subj} value={subj}>{subj}</option>
            ))}
          </select>
        </div>

        {/* Exam Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Exam Date
          </label>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={uploading}
          />
        </div>
      </div>

      {/* Password Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Encryption Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${getPasswordStrengthColor()}`}
              placeholder="Enter a strong password"
              required
              disabled={uploading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              disabled={uploading}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          {password && (
            <div className={`mt-2 p-2 rounded text-xs ${getPasswordStrengthBg()}`}>
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <div className="flex space-x-1">
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'weak' ? 'bg-red-400' : 'bg-gray-200'}`} />
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'medium' || passwordStrength === 'strong' ? 'bg-yellow-400' : 'bg-gray-200'}`} />
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'strong' ? 'bg-green-400' : 'bg-gray-200'}`} />
                  </div>
                </div>
                <span className={`capitalize font-medium ${getPasswordStrengthColor()}`}>
                  {passwordStrength}
                </span>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password *
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                confirmPassword && password !== confirmPassword ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Confirm your password"
              required
              disabled={uploading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              disabled={uploading}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          {confirmPassword && password !== confirmPassword && (
            <div className="mt-2 flex items-center space-x-2 text-red-600 text-xs">
              <AlertCircle className="w-3 h-3" />
              <span>Passwords do not match</span>
            </div>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-start space-x-3">
          <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Security Notice</p>
            <p>
              Your file will be encrypted with military-grade AES-256 encryption. 
              The password is not stored on the server - keep it safe as it cannot be recovered.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Uploading and encrypting...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={uploading || !file || !password || !subject || passwordStrength === 'weak'}
        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
      >
        {uploading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            <span>Encrypting & Uploading...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Upload & Encrypt</span>
          </div>
        )}
      </button>
    </form>
  );
};

export default UploadForm;