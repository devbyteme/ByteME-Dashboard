import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Crown, LogIn, Loader2, AlertCircle, UserCheck, ArrowRight } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User as UserAPI } from "@/api";

export default function UserLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get('restaurant');
  const tableNumber = searchParams.get('table');
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const credentials = {
        email: formData.email,
        password: formData.password
      };

      const response = await UserAPI.login(credentials);
      
      if (response.success) {
        // Redirect to menu after successful login
        navigateToMenu();
      }
    } catch (error) {
      setError(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAccess = () => {
    // For guest access, we'll create a temporary session and redirect to menu
    localStorage.setItem('guestSession', 'true');
    localStorage.setItem('guestTimestamp', Date.now().toString());
    navigateToMenu();
  };

  const navigateToMenu = () => {
    if (restaurantId) {
      navigate(`/customer-menu?restaurant=${restaurantId}&table=${tableNumber || ''}`);
    } else {
      navigate(createPageUrl("CustomerMenu"));
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-3 text-slate-900">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-800 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold">QR Dining</h1>
          </div>
        </div>

        {restaurantId && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm text-center">
            <p>Welcome to our restaurant!</p>
            {tableNumber && <p>Table: {tableNumber}</p>}
          </div>
        )}
        
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-900">Welcome Back!</CardTitle>
            <CardDescription className="text-slate-600">
              Sign in to access your personalized experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  name="email"
                  type="email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@example.com" 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-sm text-blue-800 hover:underline">Forgot password?</a>
                </div>
                <Input 
                  id="password" 
                  name="password"
                  type="password" 
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••" 
                  required 
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-11 gap-2" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In <LogIn className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            {/* Guest Access Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 gap-2 border-gray-300 hover:bg-gray-50"
              onClick={handleGuestAccess}
              disabled={isLoading}
            >
              <UserCheck className="w-4 h-4" />
              Continue as Guest
            </Button>

            <div className="mt-6 text-center text-sm">
              <p className="text-slate-600">
                Don't have an account?{" "}
                <Link 
                  to={`/user-registration${restaurantId ? `?restaurant=${restaurantId}${tableNumber ? `&table=${tableNumber}` : ''}` : ''}`} 
                  className="font-medium text-blue-800 hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 