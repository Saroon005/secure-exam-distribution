import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Lock, Eye, EyeOff, AlertCircle, FileText, Calendar, Book, ArrowLeft } from 'lucide-react';
import { apiService, fileUtils } from '../api';

const DownloadPage = ({ showNotification }) => {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    fetchFileDetails();
  }, [fileId]);

  const fetchFileDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.getFiles();
      const targetFile = response.files?.find(f => f.file_id === fileId);
      
      if (!targetFile) {
        showNotification('File not found', 'error');
        navigate('/');
        return;
      }
      
      setFile(targetFile);
    } catch (error) {
      showNotification('Failed to fetch file details: ' + error.message, 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPassword = async () => {
    if (!password.trim()) {
      showNotification('Please enter password', 'error');
      return;
    }

    try {
      setVerifying(true);
      const response = await apiService.verifyFile(fileId, password);
      
      if (response.valid) {
        setVerified(true);
        showNotification('Password verified successfully', 'success');
      }
    } catch (error) {
      showNotification(error.message, 'error');
      setVerified(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleDownload = async () => {
    if (!password.trim()) {
      showNotification('Please enter password to download', 'error');
      return;
    }

    try {
      setDownloading(true);
      const response = await apiService.downloadFile(fileId, password);
      
      // Create download
      fileUtils.downloadBlob(response.data, file.original_filename);
      showNotification(`File "${file.original_filename}" downloaded successfully`, 'success');
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setDownloading(false);
    }
  };

  const getFileIcon = (filename) => {
    const extension = filename?.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-8 h-8 text-blue-500" />;
      default:
        return <FileText className="w-8 h-8 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading file details...</p>
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">File Not Found</h3>
        <p className="text-gray-500 mb-6">The requested file could not be found.</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Files
        </button>
        
        <div className="text-sm text-gray-500">
          Secure Download Portal
        </div>
      </div>

      {/* File Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-blue-600 px-8 py-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 bg-white bg-opacity-20 rounded-lg p-3">
              {getFileIcon(file.original_filename)}
            </div>
            <div className="flex-1 text-white">
              <h1 className="text-2xl font-bold mb-2">{file.original_filename}</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm opacity-90">
                <div className="flex items-center space-x-2">
                  <Book className="w-4 h-4" />
                  <span>Subject: {file.subject}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Exam: {new Date(file.exam_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Size: {fileUtils.formatFileSize(file.file_size)}</span>
                </div>
              </div>
              <div className="mt-3 text-xs opacity-75">
                Uploaded: {formatDate(file.upload_time)}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Security Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-start space-x-3">
              <Lock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Secure Access Required</p>
                <p>
                  This file is encrypted with AES-256 encryption. Enter the correct password 
                  to verify access and download the decrypted file.
                </p>
              </div>
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Decryption Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter the password used during file upload"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && (verified ? handleDownload() : handleVerifyPassword())}
                  disabled={downloading || verifying}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  disabled={downloading || verifying}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {!verified ? (
                <button
                  onClick={handleVerifyPassword}
                  disabled={verifying || !password.trim()}
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-2" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Verify Password
                    </>
                  )}
                </button>
              ) : (
                <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-green-800">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-medium">Password Verified Successfully</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleDownload}
                disabled={downloading || !password.trim()}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download File
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Security Information */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Security Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Encryption Details</h4>
                <ul className="space-y-1">
                  <li>• AES-256-CBC encryption</li>
                  <li>• PBKDF2 key derivation</li>
                  <li>• 100,000 iterations</li>
                  <li>• Secure random salt & IV</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Privacy Protection</h4>
                <ul className="space-y-1">
                  <li>• Zero-knowledge architecture</li>
                  <li>• No passwords stored on server</li>
                  <li>• Temporary file cleanup</li>
                  <li>• Secure deletion protocols</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;