import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Crown, ArrowRight, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api";

export default function VendorRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    cuisine: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    description: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Auto-redirect after successful registration
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate(`${createPageUrl("VendorLogin")}?from=registration`);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Prepare vendor data
      const vendorData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        cuisine: formData.cuisine,
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        description: formData.description
      };

      const response = await User.registerVendor(vendorData);
      
      if (response.success) {
        setSuccess(true);
      }
    } catch (error) {
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Success state UI
  if (success) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-secondary to-brand-white p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-brand-dark mb-2">Registration Successful!</h2>
          <p className="text-brand-dark/70 mb-4">
            Your vendor account has been created successfully. Please sign in to access your dashboard.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => navigate(`${createPageUrl("VendorLogin")}?from=registration`)}
              className="w-full h-11 gap-2 bg-brand-primary hover:bg-brand-primary/90 text-brand-white transition-colors duration-200"
            >
              Go to Sign In <ArrowRight className="w-4 h-4" />
            </Button>
            <p className="text-sm text-brand-dark/50">
              Redirecting automatically in 5 seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main registration form
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-secondary to-brand-white p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Link to={createPageUrl("Welcome")} className="flex items-center gap-3 text-brand-dark">
            <img src="/src/assets/Main Logo_ByteMe.png" alt="ByteMe Logo" className="w-12 h-12" />
            <h1 className="text-2xl font-bold text-brand-dark">ByteMe</h1>
          </Link>
        </div>
        
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-brand-dark">Create a Vendor Account</CardTitle>
            <CardDescription className="text-brand-dark/70">
              Join our platform and manage your venue effortlessly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name</Label>
                <Input 
                  id="name" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Restaurant Name" 
                  required 
                />
              </div>
              
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
                <Label htmlFor="password">Password</Label>
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

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  name="phone"
                  type="tel" 
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cuisine">Cuisine Type</Label>
                <Input 
                  id="cuisine" 
                  name="cuisine"
                  value={formData.cuisine}
                  onChange={handleInputChange}
                  placeholder="Italian, Mexican, etc." 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input 
                  id="address" 
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Main Street" 
                  required 
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input 
                    id="state" 
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input 
                    id="zipCode" 
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="12345" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell us about your restaurant..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 gap-2 bg-brand-primary hover:bg-brand-primary/90 text-brand-white transition-colors duration-200" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-brand-dark/70">
                Already have an account?{" "}
                <Link to={createPageUrl("VendorLogin")} className="font-medium text-brand-primary hover:text-brand-primary/80">
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}