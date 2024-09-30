"use client"

import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import Image from 'next/image';
import logo from '../../public/asset/verboflylogo.png';
import { FaBars } from 'react-icons/fa';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-900">

      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 shadow-md">
        <div className="py-2 px-4 flex justify-between items-center">
          <Image src={logo} alt="TalkTrek" width={120} height={40} className='h-8 w-auto'/>
          <button onClick={toggleSidebar} className="text-white">
            <FaBars size={24} />
          </button>
        </div>
      </div>

      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 
        w-64 bg-gray-900 overflow-y-auto transition-transform duration-300 ease-in-out
      `}>
        <div className="min-h-screen p-4 border-r-2 border-gray-800">
          <div className="mb-4 hidden md:flex items-center w-[150px] h-[50px]">
            <Image src={logo} alt="TalkTrek" />
          </div>
          <AdminSidebar onClose={() => setSidebarOpen(false)} />
        </div>
      </div>

      <div className="flex-grow  p-4 md:p-6 mt-16 md:mt-0">
        {children}
      </div>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;