import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Chrome,
  UtensilsCrossed,
  ArrowRight
} from "lucide-react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { customerAuthService, vendorService } from "@/api";

export default function CustomerAuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get vendor ID and table number from URL
  const vendorId = searchParams.get('restaurant');
  const tableNumber = searchParams.get('table');
  
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [vendorInfo, setVendorInfo] = useState(null);
  const [vendorLoading, setVendorLoading] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  // Registration form state
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    dietaryRestrictions: [],
    acceptTerms: false
  });

  // Available dietary restrictions
  const dietaryOptions = [
    "Vegetarian",
    "Vegan",
    "Gluten-Free",
    "Dairy-Free",
    "Nut-Free",
    "Halal",
    "Kosher",
    "None"
  ];

  // Fetch vendor information when component mounts
  useEffect(() => {
    const fetchVendorInfo = async () => {
      if (vendorId) {
        setVendorLoading(true);
        try {
          const response = await vendorService.getById(vendorId);
          if (response.success) {
            setVendorInfo(response.data);
          }
        } catch (error) {
          console.error('Error fetching vendor info:', error);
        } finally {
          setVendorLoading(false);
        }
      }
    };

    fetchVendorInfo();
  }, [vendorId]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await customerAuthService.loginUser(loginData);
      
      if (response.success) {
        setSuccess("Login successful! Redirecting to menu...");
        setTimeout(() => {
          // Redirect to customer menu with authentication
          const redirectUrl = `/customer-menu?restaurant=${vendorId}&table=${tableNumber}&auth=true`;
          navigate(redirectUrl);
        }, 1500);
      } else {
        setError(response.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!registerData.acceptTerms) {
      setError("Please accept the terms and conditions");
      setIsLoading(false);
      return;
    }

    try {
      const userData = {
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        email: registerData.email,
        phone: registerData.phone,
        password: registerData.password,
        preferences: {
          dietaryRestrictions: registerData.dietaryRestrictions.filter(d => d !== "None")
        }
      };

      const response = await customerAuthService.registerUser(userData);
      
      if (response.success) {
        setSuccess("Registration successful! Redirecting to menu...");
        setTimeout(() => {
          // Redirect to customer menu with authentication
          const redirectUrl = `/customer-menu?restaurant=${vendorId}&table=${tableNumber}&auth=true`;
          navigate(redirectUrl);
        }, 1500);
      } else {
        setError(response.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    const backendUrl = 'http://localhost:3000';
    // Create the customer menu URL with restaurant and table parameters
    const customerMenuUrl = `${window.location.origin}/customer-menu?restaurant=${vendorId}&table=${tableNumber}&auth=true`;
    console.log('🔐 CustomerAuthPage: Google OAuth redirect URL:', customerMenuUrl);
    
    // Encode the URL as state parameter for Google OAuth
    const encodedState = encodeURIComponent(customerMenuUrl);
    console.log('🔐 CustomerAuthPage: Encoded state parameter:', encodedState);
    
    // Redirect to customer Google OAuth endpoint
    const googleAuthUrl = `${backendUrl}/api/auth/google/customer?state=${encodedState}`;
    console.log('🔐 CustomerAuthPage: Google OAuth URL:', googleAuthUrl);
    
    window.location.href = googleAuthUrl;
  };

  const handleGuestMode = () => {
    // Store guest session info
    localStorage.setItem('guestSession', 'true');
    localStorage.setItem('guestTimestamp', Date.now().toString());
    localStorage.setItem('guestVendorId', vendorId);
    localStorage.setItem('guestTableNumber', tableNumber);
    
    // Redirect to customer menu as guest
    const redirectUrl = `/customer-menu?restaurant=${vendorId}&table=${tableNumber}&guest=true`;
    navigate(redirectUrl);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegisterInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleDietaryRestriction = (restriction) => {
    setRegisterData(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
        ? prev.dietaryRestrictions.filter(d => d !== restriction)
        : [...prev.dietaryRestrictions, restriction]
    }));
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-secondary to-brand-white p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <img src="/Main Logo_ByteMe.png" alt="ByteMe Logo" className="w-40 h-20" />
          </div>
          
          {vendorId && tableNumber && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-brand-dark mb-2">
                {vendorLoading ? (
                  "Welcome"
                ) : vendorInfo && vendorInfo.name ? (
                  `Welcome to ${vendorInfo.name}`
                ) : (
                  "Welcome to Our Restaurant"
                )}
              </h1>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline" className="text-brand-primary border-brand-primary">
                  Table {tableNumber}
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Success/Error Messages */}
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

        {/* Main Card */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center">

          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Google OAuth Button */}
            {/* <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-brand-white px-2 text-brand-dark/60">Or continue with email</span>
              </div>
            </div> */}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-brand-dark">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={loginData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        className="pl-10"
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
                        value={loginData.password}
                        onChange={handleInputChange}
                        placeholder="Enter your password"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 gap-2 bg-brand-primary hover:bg-brand-primary/90 text-brand-white transition-colors duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Sign In <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>

                  {/* Forgot Password Link */}
                  <div className="text-center pt-2">
                    <Link
                      to="/customer-forgot-password"
                      className="text-sm text-brand-primary hover:text-brand-primary/80 transition-colors"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="firstName" className="text-slate-700">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={registerData.firstName}
                        onChange={handleRegisterInputChange}
                        placeholder="First name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-slate-700">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={registerData.lastName}
                        onChange={handleRegisterInputChange}
                        placeholder="Last name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-brand-dark">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={registerData.email}
                        onChange={handleRegisterInputChange}
                        placeholder="Enter your email"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-brand-dark">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="phone"
                        name="phone"
                        value={registerData.phone}
                        onChange={handleRegisterInputChange}
                        placeholder="Enter your phone number"
                        className="pl-10"
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
                        value={registerData.password}
                        onChange={handleRegisterInputChange}
                        placeholder="Create a password"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-brand-dark">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={registerData.confirmPassword}
                        onChange={handleRegisterInputChange}
                        placeholder="Confirm your password"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-brand-dark">Dietary Preferences</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {dietaryOptions.map((option) => (
                        <Button
                          key={option}
                          type="button"
                          variant={registerData.dietaryRestrictions.includes(option) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleDietaryRestriction(option)}
                          className={`h-8 text-xs ${
                            registerData.dietaryRestrictions.includes(option) 
                              ? 'bg-brand-primary hover:bg-brand-primary/90 text-brand-white' 
                              : 'border-brand-primary/30 text-brand-dark hover:bg-brand-primary/5'
                          }`}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      name="acceptTerms"
                      checked={registerData.acceptTerms}
                      onChange={handleRegisterInputChange}
                      className="rounded"
                    />
                    <Label htmlFor="acceptTerms" className="text-sm text-brand-dark/70">
                      I accept the terms and conditions
                    </Label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 gap-2 bg-brand-primary hover:bg-brand-primary/90 text-brand-white transition-colors duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Create Account <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <Separator />

            {/* Guest Mode Button */}
            <Button 
              onClick={handleGuestMode}
              variant="outline"
              className="w-full h-11 border-brand-primary text-brand-primary hover:bg-brand-primary/5 transition-colors duration-200"
            >
              Continue as Guest
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
