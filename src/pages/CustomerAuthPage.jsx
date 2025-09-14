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
import { customerAuthService } from "@/api";

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
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/Main Logo_ByteMe.png" alt="ByteMe Logo" className="w-40 h-20" />
    
          </div>
          
          {vendorId && tableNumber && (
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 mb-4">
              <p className="text-sm text-brand-dark/70">
                Welcome to <Badge variant="secondary">Table {tableNumber}</Badge>
              </p>
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
            <CardTitle className="text-2xl font-bold text-brand-dark">
              Welcome to Our Restaurant
            </CardTitle>
            <CardDescription className="text-brand-dark/70">
              Sign in to personalize your experience or continue as a guest
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Google OAuth Button */}
            <Button 
              onClick={handleGoogleAuth}
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
