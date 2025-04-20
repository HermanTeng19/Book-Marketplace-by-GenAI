import React, { useState, useEffect } from 'react';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) {
        setTimeout(onClose, 300); // Delay onClose to allow for exit animation
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-green-500';
    }
  };

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white shadow-lg transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      } ${getTypeStyles()}`}
    >
      <div className="flex items-center">
        <span>{message}</span>
        <button
          onClick={() => {
            setVisible(false);
            if (onClose) {
              setTimeout(onClose, 300);
            }
          }}
          className="ml-4 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
        >
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast; 