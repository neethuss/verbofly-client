import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAdminAuthStore from '@/store/adminAuthStore';
import LoadingPage from '@/components/Loading';

const protectedRoute = (WrappedComponent: React.ComponentType) => {
  return function ProtectedComponent(props: any) {
    const { isAdminAuthenticated, isLoading, initAdminAuth, adminLogout, checkTokenValidity } = useAdminAuthStore();
    const router = useRouter();

    useEffect(() => {
      const checkAuth = async () => {
        console.log('checkAuth')
        await initAdminAuth();
      };
      checkAuth();
    }, []);

    useEffect(() => {
      const tokenCheckInterval = setInterval(() => {
        if (!checkTokenValidity()) {
          adminLogout();
          router.push('/admin');
        }
      }, 60000); 

      return () => clearInterval(tokenCheckInterval);
    }, [checkTokenValidity, adminLogout, router]);

    useEffect(() => {
      if (!isLoading && !isAdminAuthenticated) {
        router.push('/admin');
      }
    }, [isLoading, isAdminAuthenticated, router]);

    if (isLoading) {
      return <LoadingPage />;
    }

    return isAdminAuthenticated ? <WrappedComponent {...props} /> : null;
  };
};

export default protectedRoute;