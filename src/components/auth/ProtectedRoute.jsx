import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/api';

export default function ProtectedRoute({ children, requireVendor = true }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = User.isAuthenticated();
      
      if (!isAuth) {
        navigate('/vendor-login');
        return;
      }

      // Get current user data
      const currentUser = await User.me();
      
      if (!currentUser) {
        navigate('/vendor-login');
        return;
      }

      // If requireVendor is true, check if user is a vendor
      if (requireVendor && currentUser.userType !== 'vendor') {
        navigate('/vendor-login');
        return;
      }

      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Authentication check failed:', error);
      navigate('/vendor-login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return children;
}
