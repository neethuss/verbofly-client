"use client";

import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
      <div className="admin-layout">
        {children}
      </div>
  );
};

export default AdminLayout;
