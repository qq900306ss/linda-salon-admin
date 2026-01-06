import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: { requireAdmin?: boolean }
) {
  return function ProtectedRoute(props: P) {
    const router = useRouter();
    const { user, isLoading, isAuthenticated } = useAuth();

    useEffect(() => {
      if (!isLoading) {
        // Not authenticated, redirect to login
        if (!isAuthenticated) {
          router.push('/login');
          return;
        }

        // Require admin but user is not admin
        if (options?.requireAdmin && user?.role !== 'admin') {
          router.push('/unauthorized');
          return;
        }
      }
    }, [isLoading, isAuthenticated, user, router]);

    // Show loading state while checking auth
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    // Not authenticated or not admin (when required)
    if (!isAuthenticated || (options?.requireAdmin && user?.role !== 'admin')) {
      return null;
    }

    // Render the protected component
    return <Component {...props} />;
  };
}
