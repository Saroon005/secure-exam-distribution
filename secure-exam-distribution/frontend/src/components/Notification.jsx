import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';

const Notification = ({ message, type = 'info', onClose, autoClose = true, duration = 5000 }) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const getNotificationStyles = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-400',
          icon: CheckCircle
        };
      case 'error':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-400',
          icon: AlertCircle
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-400',
          icon: AlertTriangle
        };
      default:
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-400',
          icon: Info
        };
    }
  };

  const styles = getNotificationStyles();
  const Icon = styles.icon;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full animate-in slide-in-from-right duration-300">
      <div className={`${styles.bgColor} ${styles.borderColor} border rounded-lg shadow-lg p-4`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`w-5 h-5 ${styles.iconColor}`} />
          </div>
          
          <div className={`ml-3 flex-1 ${styles.textColor}`}>
            <p className="text-sm font-medium">
              {message}
            </p>
          </div>
          
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md ${styles.bgColor} ${styles.textColor} hover:${styles.textColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${styles.bgColor.split('-')[1]}-50 focus:ring-${styles.iconColor.split('-')[1]}-400`}
            >
              <span className="sr-only">Close</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Progress bar for auto-close */}
        {autoClose && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className={`h-1 rounded-full transition-all ease-linear ${
                  type === 'success' ? 'bg-green-400' :
                  type === 'error' ? 'bg-red-400' :
                  type === 'warning' ? 'bg-yellow-400' :
                  'bg-blue-400'
                }`}
                style={{
                  animation: `shrink ${duration}ms linear`,
                  width: '100%'
                }}
              />
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        @keyframes slide-in-from-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-in {
          animation-fill-mode: both;
        }
        
        .slide-in-from-right {
          animation-name: slide-in-from-right;
        }
        
        .duration-300 {
          animation-duration: 300ms;
        }
      `}</style>
    </div>
  );
};

export default Notification;