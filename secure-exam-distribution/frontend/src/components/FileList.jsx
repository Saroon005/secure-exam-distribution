import React, { useState } from 'react';
import { Download, Trash2, Eye, Calendar, Book, FileText, AlertCircle } from 'lucide-react';
import { apiService, fileUtils } from '../api';

const FileList = ({ files, onDeleteSuccess, showNotification }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [password, setPassword] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  const handleVerifyAccess = async (fileId) => {
    if (!password.trim()) {
      showNotification('Please enter password', 'error');
      return;
    }

    try {
      setVerifying(true);
      const response = await apiService.verifyFile(fileId, password);
      
      if (response.valid) {
        showNotification('Password verified successfully', 'success');
        // You could show file details here
      }
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleDownload = async (fileId, filename) => {
    if (!password.trim()) {
      showNotification('Please enter password to download', 'error');
      return;
    }

    try {
      setDownloading(true);
      const response = await apiService.downloadFile(fileId, password);
      
      // Create download
      fileUtils.downloadBlob(response.data, filename);
      showNotification(`File "${filename}" downloaded successfully`, 'success');
      setPassword('');
      setSelectedFile(null);
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async (fileId, filename) => {
    try {
      setDeleting(fileId);
      await apiService.deleteFile(fileId);
      onDeleteSuccess(filename);
      setShowDeleteModal(null);
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (filename) => {
    const extension = filename.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-5 h-5 text-blue-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  if (!files || files.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No files uploaded yet</h3>
        <p className="text-gray-500">Upload your first exam paper to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {files.map((file) => (
        <div key={file.file_id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="flex-shrink-0">
                  {getFileIcon(file.original_filename)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-medium text-gray-900 truncate">
                    {file.original_filename}
                  </h4>
                  
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
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
                  
                  <div className="mt-2 text-xs text-gray-500">
                    Uploaded: {formatDate(file.upload_time)}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => setSelectedFile(selectedFile === file.file_id ? null : file.file_id)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
                
                <button
                  onClick={() => setShowDeleteModal(file.file_id)}
                  className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  disabled={deleting === file.file_id}
                >
                  {deleting === file.file_id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700 mr-2" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Delete
                </button>
              </div>
            </div>

            {/* Password Input Section */}
            {selectedFile === file.file_id && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter decryption password:
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password to decrypt and download"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleDownload(file.file_id, file.original_filename)}
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleVerifyAccess(file.file_id)}
                      disabled={verifying || !password.trim()}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {verifying ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-2" />
                      ) : (
                        <Eye className="w-4 h-4 mr-2" />
                      )}
                      Verify
                    </button>
                    
                    <button
                      onClick={() => handleDownload(file.file_id, file.original_filename)}
                      disabled={downloading || !password.trim()}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {downloading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      Download
                    </button>
                  </div>
                </div>
                
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      Enter the password used during upload to decrypt and download this file.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">Delete File</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Are you sure you want to delete this file? This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3 justify-end">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const file = files.find(f => f.file_id === showDeleteModal);
                    handleDelete(showDeleteModal, file?.original_filename);
                  }}
                  disabled={deleting === showDeleteModal}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {deleting === showDeleteModal ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileList;