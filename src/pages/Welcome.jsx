import React from "react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { Crown, LogIn, UserPlus, Store } from "lucide-react";
import { Link } from "react-router-dom";

export default function Welcome() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-secondary to-brand-white p-4">
      <div className="text-center max-w-4xl mx-auto">
        <div className="w-36 h-24 rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-6">
          <img src="/Main Logo_ByteMe.png" alt="ByteMe Logo" className="w-24 h-16" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-brand-dark">
          Welcome to ByteMe
        </h1>
        <p className="text-brand-dark/70 mt-4 max-w-2xl mx-auto">
          The all-in-one solution for restaurant owners to manage their venue, streamline orders, and delight customers with QR code technology.
        </p>
        
        {/* Vendor Section */}
        <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Store className="w-6 h-6 text-brand-primary" />
            <h2 className="text-2xl font-bold text-brand-dark">For Restaurant Owners</h2>
          </div>
          <p className="text-brand-dark/70 mb-6">
            Create digital menus, generate QR codes for tables, track orders in real-time, and manage your restaurant operations from one dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={createPageUrl("VendorLogin")}>
              <Button className="h-12 px-8 text-lg gap-2 w-full sm:w-auto bg-brand-primary hover:bg-brand-primary/90 text-brand-white transition-colors duration-200">
                <LogIn className="w-5 h-5" />
                Vendor Sign In
              </Button>
            </Link>
            <Link to={createPageUrl("VendorRegistration")}>
              <Button
                variant="outline"
                className="h-12 px-8 text-lg gap-2 bg-brand-white/80 border-brand-primary text-brand-primary hover:bg-brand-primary/5 w-full sm:w-auto transition-colors duration-200"
              >
                <UserPlus className="w-5 h-5" />
                Vendor Sign Up
              </Button>
            </Link>
          </div>
        </div>

        {/* Demo Section */}
        <div className="mt-6 text-center">
          <p className="text-brand-dark/50 text-sm">
            Want to see how it works?{" "}
            <Link to={createPageUrl("QRScanner")} className="text-brand-primary hover:text-brand-primary/80 font-medium">
              Try our demo
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}