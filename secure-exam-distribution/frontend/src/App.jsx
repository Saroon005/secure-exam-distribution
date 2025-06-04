import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import DownloadPage from './pages/DownloadPage';
import Notification from './components/Notification';
import { Shield, Lock } from 'lucide-react';

function App() {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const clearNotification = () => {
    setNotification(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-lg">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Secure Exam Distribution
                  </h1>
                  <p className="text-sm text-gray-500">
                    Encrypted Academic Content Management
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Lock className="w-4 h-4" />
                <span>AES-256 Encrypted</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route 
              path="/" 
              element={<Home showNotification={showNotification} />} 
            />
            <Route 
              path="/download/:fileId" 
              element={<DownloadPage showNotification={showNotification} />} 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-gray-500">
                © 2024 Secure Exam Distribution System. Built with security in mind.
              </div>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>System Online</span>
                </div>
                <div className="text-sm text-gray-500">
                  Flask + React + AES Encryption
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Notification */}
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={clearNotification}
          />
        )}
      </div>
    </Router>
  );
}

export default App;