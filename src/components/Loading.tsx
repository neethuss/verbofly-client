import React from 'react';

const LoadingPage: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-900">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-500"></div>
      <h2 className="text-2xl font-semibold mt-4 text-gray-700">Loading...</h2>
      <p className="text-gray-500 mt-2">Please wait while we set things up for you.</p>
    </div>
  );
};

export default LoadingPage;