import React from "react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { Crown, LogIn, UserPlus, Store } from "lucide-react";
import { Link } from "react-router-dom";

export default function Welcome() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-100 p-4">
      <div className="text-center max-w-4xl mx-auto">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-800 to-amber-500 rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-6">
          <Crown className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
          Welcome to QR Dining
        </h1>
        <p className="text-slate-600 mt-4 max-w-2xl mx-auto">
          The all-in-one solution for restaurant owners to manage their venue, streamline orders, and delight customers with QR code technology.
        </p>
        
        {/* Vendor Section */}
        <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Store className="w-6 h-6 text-blue-800" />
            <h2 className="text-2xl font-bold text-slate-900">For Restaurant Owners</h2>
          </div>
          <p className="text-slate-600 mb-6">
            Create digital menus, generate QR codes for tables, track orders in real-time, and manage your restaurant operations from one dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={createPageUrl("VendorLogin")}>
              <Button className="btn-primary h-12 px-8 text-lg gap-2 w-full sm:w-auto">
                <LogIn className="w-5 h-5" />
                Vendor Sign In
              </Button>
            </Link>
            <Link to={createPageUrl("VendorRegistration")}>
              <Button
                variant="outline"
                className="h-12 px-8 text-lg gap-2 bg-white/80 w-full sm:w-auto"
              >
                <UserPlus className="w-5 h-5" />
                Vendor Sign Up
              </Button>
            </Link>
          </div>
        </div>

        {/* Demo Section */}
        <div className="mt-6 text-center">
          <p className="text-slate-500 text-sm">
            Want to see how it works?{" "}
            <Link to={createPageUrl("QRScanner")} className="text-blue-800 hover:underline font-medium">
              Try our demo
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}