

// "use client"

// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// interface AuthContextType {
//   user: any;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   setUserAuth: (user: any) => void;
//   logout: () => void;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUserAuth] = useState<any>(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const router = useRouter()

//   useEffect(() => {
//     console.log('use')
//     const storedUser = localStorage.getItem('user');
//     const accessToken = localStorage.getItem('userAccessToken');
//     if (storedUser && accessToken) {
//       try {
//         const parsedUser = JSON.parse(storedUser);
//         setUserAuth(parsedUser);
//         console.log('setting user',user)
//         setIsAuthenticated(true);
//       } catch (error) {
//         console.error('Failed to parse user from localStorage:', error);
//         localStorage.removeItem('user');
//         localStorage.removeItem('userAccessToken');
//         setIsAuthenticated(false);
//       }
//     }else {
//       setIsAuthenticated(false);
//     }
//     setIsLoading(false);
//   }, []);

//   const logout = () => {
//     localStorage.removeItem('user');
//     localStorage.removeItem('userAccessToken');
//     setUserAuth(null);
//     setIsAuthenticated(false);
//     router.push('/login')
//   };

//   return (
//     <AuthContext.Provider value={{ user, isAuthenticated, isLoading, setUserAuth, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };
