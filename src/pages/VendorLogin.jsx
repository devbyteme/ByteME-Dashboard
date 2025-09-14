import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Crown, ArrowRight, Loader2, CheckCircle, AlertCircle, Mail, Lock, Chrome } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { authService } from "@/api";

export default function VendorLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Check for Google OAuth callback parameters
    const token = searchParams.get('token');
    const googleAuth = searchParams.get('googleAuth');
    const userData = searchParams.get('userData');
    const error = searchParams.get('error');

    if (error) {
      setError(error);
    } else if (token && googleAuth) {
      // Handle successful Google OAuth login
      handleGoogleAuthSuccess(token, userData);
    }
  }, [searchParams]);

  const handleGoogleAuthSuccess = async (token, userData) => {
    try {
      console.log('🔐 VendorLogin: Google OAuth success, token received');
      
      let user;
      if (userData) {
        // Parse user data from URL parameters
        try {
          user = JSON.parse(decodeURIComponent(userData));
          console.log('🔐 VendorLogin: User data parsed from URL:', user.email);
        } catch (parseError) {
          console.error('Error parsing user data from URL:', parseError);
          user = null;
        }
      }
      
      // Store the token and user data using the correct vendor storage keys
      authService.setAuth(token, user);
      
      if (user) {
        console.log('🔐 VendorLogin: Google OAuth completed successfully with user data');
        setSuccess("Google login successful! Redirecting to dashboard...");
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        // Fallback: try to get user profile from API
        console.log('🔐 VendorLogin: No user data in URL, fetching from API...');
        const apiUser = await authService.getCurrentUser();
        if (apiUser) {
          console.log('🔐 VendorLogin: User profile loaded from API successfully');
          setSuccess("Google login successful! Redirecting to dashboard...");
          
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          throw new Error('Failed to load user profile');
        }
      }
    } catch (error) {
      console.error('Error handling Google auth success:', error);
      setError("Failed to complete Google authentication");
      // Clear any partial auth data
      authService.clearAuth();
    }
  };

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
    setSuccess("");

    try {
      const response = await authService.loginVendor(formData);
      
      if (response.success) {
        setSuccess("Login successful! Redirecting to dashboard...");
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(response.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please check your credentials and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Redirect to backend Google OAuth endpoint
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
    window.location.href = `${backendUrl}/auth/google`;
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-secondary to-brand-white p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
                      <div className="flex items-center gap-3 text-brand-dark">
            <img src="/Main Logo_ByteMe.png" alt="ByteMe Logo" className="w-40 h-20" />
          </div>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {success}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          </div>
        )}
        
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-brand-dark">
              Vendor Login
            </CardTitle>
            <CardDescription className="text-brand-dark/70">
              Access your restaurant management dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Google OAuth Button */}
            <Button 
              onClick={handleGoogleSignIn}
              className="w-full bg-brand-white text-brand-dark border-2 border-brand-primary/20 hover:bg-brand-primary/5 hover:border-brand-primary/30 transition-colors duration-200"
            >
              <Chrome className="w-5 h-5 mr-2" />
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-brand-white px-2 text-brand-dark/60">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-brand-dark">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="pl-10 bg-brand-white text-brand-dark"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="password" className="text-brand-dark">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="pl-10 bg-brand-white text-brand-dark"
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-11 text-lg bg-brand-primary hover:bg-brand-primary/90 text-brand-white transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="text-center space-y-2">
              <p className="text-sm text-brand-dark/70">
                Don't have an account?{" "}
                <Link 
                  to={createPageUrl("VendorRegistration")}
                  className="text-brand-primary hover:text-brand-primary/80 font-medium"
                >
                  Sign up here
                </Link>
              </p>
              <p className="text-sm text-brand-dark/70">
                <Link 
                  to={createPageUrl("VendorForgotPassword")}
                  className="text-brand-primary hover:text-brand-primary/80 font-medium"
                >
                  Forgot your password?
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}