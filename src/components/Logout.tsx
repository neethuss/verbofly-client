import React from 'react';
import { FaSignOutAlt } from 'react-icons/fa';

const LogoutLoadingPage: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-900">
      <div className="relative">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-400"></div>
        <FaSignOutAlt className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl text-yellow-400" />
      </div>
      <h2 className="text-2xl font-semibold mt-6 text-yellow-400">Logging Out</h2>
      <p className="text-gray-400 mt-2 text-center max-w-md">
        Please wait while we securely log you out of your account.
      </p>
    </div>
  );
};

export default LogoutLoadingPage;