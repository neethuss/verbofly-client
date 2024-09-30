// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import useAuthStore from '@/store/authStore';
// import LoadingPage from '@/components/Loading';

// const protectedRoute = (WrappedComponent: React.ComponentType) => {
//   return function ProtectedComponent(props: any) {
//     const { isAuthenticated, isLoading, initAuth } = useAuthStore();
//     const router = useRouter();

//     useEffect(() => {
//       initAuth();
//     }, []);

//     useEffect(() => {
//       if (!isLoading && !isAuthenticated) {
//         router.push('/login');
//       }
//     }, [isLoading, isAuthenticated, router]);

//     if (isLoading) {
//       return <LoadingPage/>
//     }

//     return isAuthenticated ? <WrappedComponent {...props} /> : null;
//   };
// };

// export default protectedRoute;


import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import LoadingPage from '@/components/Loading';

const protectedRoute = (WrappedComponent: React.ComponentType) => {
  return function ProtectedComponent(props: any) {
    const { isAuthenticated, isLoading, initAuth, logout } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
      const checkAuth = async () => {
        await initAuth();
        const token = localStorage.getItem("userAccessToken");
        if (!token) {
          logout();
          router.push('/login');
        }
      };
      checkAuth();
    }, []);

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
      return <LoadingPage />;
    }

    return isAuthenticated ? <WrappedComponent {...props} /> : null;
  };
};

export default protectedRoute;