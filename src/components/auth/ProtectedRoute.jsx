import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, authService } from '@/api';

export default function ProtectedRoute({ children, requireVendor = false, requireUser = false }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check for vendor authentication first
      const isVendorAuth = authService.isAuthenticated();
      let currentUser = null;

      if (isVendorAuth) {
        currentUser = authService.getCurrentUser();
        if (currentUser) {
          currentUser.userType = 'vendor';
        }
      } else {
        // Check for user authentication
        const isUserAuth = User.isAuthenticated();
        if (isUserAuth) {
          currentUser = await User.me();
          if (currentUser) {
            currentUser.userType = 'user';
          }
        }
      }

      if (!currentUser) {
        if (requireVendor) {
          navigate('/vendor-login');
        } else if (requireUser) {
          navigate('/user-login');
        } else {
          navigate('/welcome');
        }
        return;
      }

      // Check user type requirements
      if (requireVendor && currentUser.userType !== 'vendor') {
        navigate('/vendor-login');
        return;
      }

      if (requireUser && currentUser.userType !== 'user') {
        navigate('/user-login');
        return;
      }

      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Authentication check failed:', error);
      if (requireVendor) {
        navigate('/vendor-login');
      } else if (requireUser) {
        navigate('/user-login');
      } else {
        navigate('/welcome');
      }
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
