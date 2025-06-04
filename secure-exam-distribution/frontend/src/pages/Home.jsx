import React, { useState, useEffect } from 'react';
import UploadForm from '../components/UploadForm';
import FileList from '../components/FileList';
import { apiService } from '../api';
import { Upload, Files, Activity, Shield } from 'lucide-react';

const Home = ({ showNotification }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    recentUploads: 0
  });
  const [activeTab, setActiveTab] = useState('upload');

  useEffect(() => {
    fetchFiles();
    checkSystemHealth();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await apiService.getFiles();
      setFiles(response.files || []);
      
      // Calculate stats
      const totalFiles = response.files?.length || 0;
      const totalSize = response.files?.reduce((sum, file) => sum + file.file_size, 0) || 0;
      const today = new Date().toISOString().split('T')[0];
      const recentUploads = response.files?.filter(file => 
        file.upload_time.startsWith(today)
      ).length || 0;
      
      setStats({ totalFiles, totalSize, recentUploads });
    } catch (error) {
      showNotification('Failed to fetch files: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkSystemHealth = async () => {
    try {
      await apiService.healthCheck();
      showNotification('System is online and secure', 'success');
    } catch (error) {
      showNotification('System health check failed', 'warning');
    }
  };

  const handleUploadSuccess = (uploadedFile) => {
    showNotification(
      `File "${uploadedFile.original_filename}" uploaded and encrypted successfully`,
      'success'
    );
    fetchFiles(); // Refresh file list
  };

  const handleDeleteSuccess = (deletedFileName) => {
    showNotification(`File "${deletedFileName}" deleted successfully`, 'success');
    fetchFiles(); // Refresh file list
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Secure Exam Paper Distribution
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload, encrypt, and securely distribute exam papers with military-grade AES-256 encryption. 
            Ensure academic integrity and confidentiality with our advanced cryptographic system.
          </p>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Files</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalFiles}</p>
            </div>
            <Files className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Storage</p>
              <p className="text-3xl font-bold text-gray-900">{formatFileSize(stats.totalSize)}</p>
            </div>
            <Activity className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Uploads</p>
              <p className="text-3xl font-bold text-gray-900">{stats.recentUploads}</p>
            </div>
            <Upload className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'upload'
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Upload Exam Paper</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'files'
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Files className="w-4 h-4" />
                <span>Manage Files ({files.length})</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-8">
          {activeTab === 'upload' && (
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Upload New Exam Paper
                </h3>
                <p className="text-gray-600">
                  Select your exam paper file and provide a secure password for encryption. 
                  Supported formats: PDF, DOC, DOCX, TXT, RTF (Max 50MB)
                </p>
              </div>
              <UploadForm 
                onUploadSuccess={handleUploadSuccess}
                showNotification={showNotification}
              />
            </div>
          )}

          {activeTab === 'files' && (
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Encrypted Files Management
                </h3>
                <p className="text-gray-600">
                  View, download, and manage your encrypted exam papers. 
                  All files are secured with AES-256 encryption.
                </p>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <span className="ml-3 text-gray-600">Loading files...</span>
                </div>
              ) : (
                <FileList 
                  files={files}
                  onDeleteSuccess={handleDeleteSuccess}
                  showNotification={showNotification}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Security Information */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200 p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <Shield className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-indigo-900 mb-2">
              Security Features
            </h4>
            <ul className="text-sm text-indigo-700 space-y-1">
              <li>• AES-256-CBC encryption with PBKDF2 key derivation</li>
              <li>• 100,000 iterations for enhanced password security</li>
              <li>• Secure random salt and IV generation for each file</li>
              <li>• No passwords stored on server - zero-knowledge architecture</li>
              <li>• Temporary file cleanup and secure deletion</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;