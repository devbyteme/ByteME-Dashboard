import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, UserCircle, Loader2, Crown } from 'lucide-react';
import { vendorService } from '@/api';
import ByteMeLogo from '@/components/ByteMeLogo';

export default function CustomerLoginSelection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [vendorInfo, setVendorInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const vendorId = searchParams.get('restaurant');
  const tableNumber = searchParams.get('table');

  useEffect(() => {
    const fetchVendorInfo = async () => {
      if (vendorId) {
        setIsLoading(true);
        try {
          const response = await vendorService.getById(vendorId);
          if (response.success) {
            setVendorInfo(response.data);
          }
        } catch (error) {
          console.error('Error fetching vendor info:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchVendorInfo();
  }, [vendorId]);

  const handleEmailLogin = () => {
    // Navigate to customer auth page with restaurant and table info
    navigate(`/customer-auth?restaurant=${vendorId}&table=${tableNumber}`);
  };

  const handleGuestMode = () => {
    // Store guest session info
    localStorage.setItem('guestSession', 'true');
    localStorage.setItem('guestTimestamp', Date.now().toString());
    localStorage.setItem('guestVendorId', vendorId);
    localStorage.setItem('guestTableNumber', tableNumber);
    
    // Redirect directly to customer menu as guest
    navigate(`/customer-menu?restaurant=${vendorId}&table=${tableNumber}&guest=true`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-brand-secondary to-brand-white">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (!vendorId || !tableNumber) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-brand-secondary to-brand-white p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-red-600">Invalid QR code. Please scan again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-secondary to-brand-white p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
           <img src="/Main Logo_ByteMe.png" alt="ByteMe Logo" className="w-32 h-16" />
          </div>
          
          {vendorInfo && (
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-brand-dark">
                Welcome to {vendorInfo.name}
              </h1>
              <div className="flex items-center justify-center gap-2 text-brand-dark/70">
                <p className="text-sm">Table {tableNumber}</p>
              </div>
            </div>
          )}
          
          <p className="text-brand-dark/80 text-lg">
            How would you like to continue?
          </p>
        </div>

        {/* Selection Cards */}
        <div className="space-y-4">

           {/* Guest Mode Card */}
           <Card className="border-2 hover:border-brand-accent transition-all duration-200 cursor-pointer hover:shadow-lg">
            <CardContent className="p-6">
              <button
                onClick={handleGuestMode}
                className="w-full text-left space-y-3"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-brand-accent/10 rounded-lg">
                    <UserCircle className="w-6 h-6 text-brand-accent" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="text-xl font-semibold text-brand-dark">
                      Start Ordering
                    </h3>
                    <p className="text-sm text-brand-dark/70">
                      Browse the menu and place orders without creating an account. Perfect for a quick visit
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                </div>
              </button>
            </CardContent>
          </Card>
          {/* Email Login Card */}
          <Card className="border-2 hover:border-brand-primary transition-all duration-200 cursor-pointer hover:shadow-lg">
            <CardContent className="p-6">
              <button
                onClick={handleEmailLogin}
                className="w-full text-left space-y-3"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-brand-primary/10 rounded-lg">
                    <Mail className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="text-xl font-semibold text-brand-dark">
                      Sign in with Email
                    </h3>
                    <p className="text-sm text-brand-dark/70">
                      Login or create an account to save your preferences, view order history, and get personalized recommendations
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                </div>
              </button>
            </CardContent>
          </Card>

         
        </div>
      </div>
    </div>
  );
}

