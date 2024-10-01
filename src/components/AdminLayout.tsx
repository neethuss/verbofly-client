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
    <div className="h-screen flex flex-col md:flex-row bg-gray-900 overflow-hidden">
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 shadow-md h-12">
        <div className="py-2 px-4 flex justify-between items-center">
          <Image src={logo} alt="TalkTrek" width={120} height={40} className='h-8 w-auto'/>
          <button onClick={toggleSidebar} className="text-white">
            <FaBars size={24} />
          </button>
        </div>
      </header>
      <aside className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 fixed md:relative top-0 left-0 z-50 
        w-52 bg-gray-900 transition-transform duration-300 ease-in-out
        h-screen flex flex-col
      `}>
        <div className="flex flex-col p-4 border-r-2 border-gray-800 h-full overflow-y-auto">
          <div className="mb-4 hidden md:flex items-center w-[150px] h-[50px]">
            <Image src={logo} alt="TalkTrek" />
          </div>
          <AdminSidebar onClose={() => setSidebarOpen(false)} />
        </div>
      </aside>

      <main className="flex-grow md:h-screen overflow-y-auto p-4 md:p-6 mt-12 md:mt-0">
        {children}
      </main>

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