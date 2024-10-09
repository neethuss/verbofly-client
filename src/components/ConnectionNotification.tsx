"use client"

import { useSocketStore } from '@/store/socketStore';
import { Notification } from '@/Types/chat';
import { ConsoleLevel } from '@zegocloud/zego-uikit-prebuilt';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

const NotificationComponent = () => {
 
  const {notifications, removeNotification} = useSocketStore()

  const router = useRouter()

  const openNotification = (notification: Notification) => {
    removeNotification(notification.id);
    const userId = notification.userId
    router.push(`/nativeSpeakers/${userId}`)
  };

  if (notifications.length === 0) return null;
  console.log(notifications,'noti')

  return (
    <div style={{
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      maxHeight: '80vh',
      overflowY: 'auto',
    }}>
      {notifications.map(notification => (
        <div key={notification.id} className="w-80 bg-gray-600 rounded-lg shadow-md p-4 font-sans text-white">
          <div className="flex items-center mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span className="ml-2 font-bold">New Connection Request</span>
            <button 
              onClick={() => removeNotification(notification.id)}
              className="ml-auto bg-transparent border-none cursor-pointer text-white text-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="mb-2">
            {notification.type === 'received'
              ? `${notification.username.charAt(0).toUpperCase() + notification.username.slice(1)} sent you a connection request.`
              : `${notification.username.charAt(0).toUpperCase() + notification.username.slice(1)} accepted your connection request`}
          </p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => removeNotification(notification.id)}
              className="px-2 py-1 rounded text-white bg-red-500 hover:bg-red-600 transition-colors duration-200"
            >
              Close
            </button>
            <button
              onClick={() => openNotification(notification)}
              className="px-2 py-1 rounded text-gray-800 bg-yellow-500 hover:bg-yellow-600 transition-colors duration-200"
            >
              Open
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationComponent;