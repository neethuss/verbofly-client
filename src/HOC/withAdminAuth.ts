"use client"
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';


const withProtectedRoute = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const Wrapper = (props: P) => {
    const router = useRouter();
    const isAuthenticated = typeof window !== 'undefined' ? !!localStorage.getItem('adminAccessToken') : false;

    useEffect(() => {
      if (!isAuthenticated) {
        router.push('/admin');
      }
    }, [isAuthenticated, router]);


    return isAuthenticated ? React.createElement(WrappedComponent, props) : null;
  };

  return Wrapper;
};

export default withProtectedRoute;
