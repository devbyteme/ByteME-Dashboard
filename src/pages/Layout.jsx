

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  QrCode, 
  LayoutDashboard, 
  MenuIcon, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  UtensilsCrossed,
  Crown,
  User as UserIcon,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { User } from "@/api";
import ByteMeLogo from '../components/ByteMeLogo';
import VendorProfile from '../components/vendor/VendorProfile';
import AccessManagement from '../components/vendor/AccessManagement';

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Menu Management",
    url: createPageUrl("MenuManagement"),
    icon: MenuIcon,
  },
  {
    title: "Orders",
    url: createPageUrl("Orders"),
    icon: ShoppingCart,
  },
  {
    title: "QR Generator",
    url: createPageUrl("QRGenerator"),
    icon: QrCode,
  },
  {
    title: "Analytics",
    url: createPageUrl("Analytics"),
    icon: BarChart3,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = User.isAuthenticated();
      
      if (!isAuth) {
        navigate('/vendor-login');
        return;
      }

      // Get current user data
      const currentUser = await User.me();
      
      if (!currentUser) {
        navigate('/vendor-login');
        return;
      }

      setUser(currentUser);
    } catch (error) {
      console.error('Authentication check failed:', error);
      navigate('/vendor-login');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout functionality
  const handleLogout = async () => {
    try {
      // Use the proper auth service logout method
      await User.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Navigate to login page
      navigate('/vendor-login');
    }
  };

  // Handle profile updates
  const handleProfileUpdate = (updatedUser) => {
    // Update the user state with the new data
    setUser(updatedUser);
  };

  const isAuthFlow = ["Welcome", "VendorLogin", "VendorRegistration"].includes(currentPageName);
  const isCustomerView = location.pathname.includes("CustomerOrder") || location.pathname.includes("CustomerProfile");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthFlow || isCustomerView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <style>{`
          .btn-primary {
            background-color: rgb(30 58 138) !important;
            color: white !important;
            border-color: rgb(30 58 138) !important;
          }
          .btn-primary:hover {
            background-color: rgb(29 78 216) !important;
            border-color: rgb(29 78 216) !important;
          }
          .btn-secondary {
            background-color: white !important;
            color: rgb(30 58 138) !important;
            border-color: rgb(226 232 240) !important;
          }
          .btn-secondary:hover {
            background-color: rgb(248 250 252) !important;
          }
          .text-readable {
            color: rgb(30 41 59) !important;
          }
          .text-readable-light {
            color: rgb(71 85 105) !important;
          }
        `}</style>
        {children}
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
        <style>{`
          .btn-primary {
            background-color: rgb(30 58 138) !important;
            color: white !important;
            border-color: rgb(30 58 138) !important;
          }
          .btn-primary:hover {
            background-color: rgb(29 78 216) !important;
            border-color: rgb(29 78 216) !important;
          }
          .btn-secondary {
            background-color: white !important;
            color: rgb(30 58 138) !important;
            border-color: rgb(226 232 240) !important;
          }
          .btn-secondary:hover {
            background-color: rgb(248 250 252) !important;
          }
          .text-readable {
            color: rgb(30 41 59) !important;
          }
          .text-readable-light {
            color: rgb(71 85 105) !important;
          }
        `}</style>
        
        <Sidebar className="border-r border-slate-200 bg-white/95 backdrop-blur-sm">
          <SidebarHeader className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
            <img src="/Main Logo_ByteMe.png" alt="ByteMe Logo" className="w-20 h-10" />
              <div>
                <h2 className="font-bold text-brand-dark text-lg">ByteMe</h2>
                <p className="text-xs text-brand-dark/70">Digital Dining Solutions</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                Management
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-blue-50 hover:text-blue-800 transition-all duration-200 rounded-xl mb-1 ${
                          location.pathname === item.url 
                            ? 'bg-gradient-to-r from-blue-800 to-blue-700 text-white shadow-lg' 
                            : 'text-slate-700'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200 p-6">
            <div className="space-y-3">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">
                    {user?.name || user?.restaurantName || 'Vendor'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{user?.email || 'vendor@example.com'}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout} 
                  className="text-slate-500 hover:text-slate-800"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Profile Settings */}
              <VendorProfile user={user} onProfileUpdate={handleProfileUpdate} />
              
              {/* Access Management */}
              <AccessManagement user={user} />
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold text-slate-900">ByteMe</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

