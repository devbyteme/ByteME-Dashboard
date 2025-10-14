import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Mail, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ArrowRight
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { authService } from "@/api";

export default function VendorForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await authService.forgotPassword({ email });
      
      if (response.success) {
        setSuccess(true);
        setEmailSent(true);
      } else {
        setError(response.message || "Failed to send reset email");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setError(error.response?.data?.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await authService.forgotPassword({ email });
      
      if (response.success) {
        setSuccess("Reset email sent again successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.message || "Failed to resend email");
      }
    } catch (error) {
      console.error("Resend email error:", error);
      setError("Failed to resend email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-secondary to-brand-white p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src="/Main Logo_ByteMe.png" alt="ByteMe Logo" className="w-20 aspect-[551/371] object-contain" />
              <h1 className="text-2xl font-bold text-brand-dark">ByteMe</h1>
            </div>
          </div>

          {/* Success Message */}
          <Card className="bg-brand-white/90 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-brand-dark">
                Check Your Email
              </CardTitle>
              <CardDescription className="text-brand-dark/70">
                We've sent a password reset link to <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-lg p-4">
                <p className="text-sm text-brand-dark/80 text-center">
                  Click the link in your email to reset your password. The link will expire in 1 hour.
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleResendEmail}
                  variant="outline"
                  className="w-full h-11 border-brand-primary text-brand-primary hover:bg-brand-primary/5 transition-colors duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Resend Email <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <Button 
                  onClick={() => setEmailSent(false)}
                  variant="ghost"
                  className="w-full h-11 text-brand-dark hover:text-brand-primary"
                >
                  Use Different Email
                </Button>
              </div>

              <div className="text-center">
                <Link 
                  to={createPageUrl("VendorLogin")}
                  className="text-sm text-brand-primary hover:text-brand-primary/80 font-medium"
                >
                  ← Back to Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-secondary to-brand-white p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/Main Logo_ByteMe.png" alt="ByteMe Logo" className="w-20 aspect-[551/371] object-contain" />
          </div>
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
        <Card className="bg-brand-white/90 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-brand-dark">
              Forgot Your Password?
            </CardTitle>
            <CardDescription className="text-brand-dark/70">
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-brand-dark">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="pl-10 bg-brand-white text-brand-dark"
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
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  <>
                    Send Reset Link <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="text-center space-y-2">
              <p className="text-sm text-brand-dark/70">
                Remember your password?{" "}
                <Link 
                  to={createPageUrl("VendorLogin")}
                  className="text-brand-primary hover:text-brand-primary/80 font-medium"
                >
                  Sign in here
                </Link>
              </p>
              <p className="text-xs text-brand-dark/50">
                Need help? Contact our support team
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
