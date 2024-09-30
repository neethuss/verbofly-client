// "use client"

// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// interface AdminAuthContextType {
//   admin: any;
//   isAuthenticated: boolean;
//   isLoading : boolean;
//   setAdmin: (admin: any) => void;
//   logout: () => void;
// }

// const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [admin, setAdmin] = useState<any>(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isLoading, setIsLoading] = useState(true)

//   const router = useRouter()

//   useEffect(() => {
//     const storedAdmin = localStorage.getItem('admin');
//     const accessToken = localStorage.getItem('adminAccessToken');
//     if (storedAdmin && accessToken) {
//       try {
//         const parsedAdmin = JSON.parse(storedAdmin);
//         setAdmin(parsedAdmin);
//         setIsAuthenticated(true);
//       } catch (error) {
//         console.error('Failed to parse user from localStorage:', error);
//         localStorage.removeItem('admin');
//         localStorage.removeItem('adminAccessToken');
//         setIsAuthenticated(false);
//       }
//     }else {
//       setIsAuthenticated(false)
//     }
//     setIsLoading(false)
//   }, []);

//   const logout = () => {
//     localStorage.removeItem('admin');
//     localStorage.removeItem('adminAccessToken');
//     setAdmin(null);
//     setIsAuthenticated(false);
//     router.push('/admin')
//   };

//   return (
//     <AdminAuthContext.Provider value={{ admin, isAuthenticated, isLoading, setAdmin, logout }}>
//       {children}
//     </AdminAuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AdminAuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };
