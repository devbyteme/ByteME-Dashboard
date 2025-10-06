import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  ShoppingCart, 
  User, 
  LogOut, 
  UtensilsCrossed,
  Clock,
  Star,
  Plus,
  Minus,
  AlertCircle,
  X
} from "lucide-react";
import { MenuItem, Order, customerAuthService } from "@/api";
import ByteMeLogo from "../components/ByteMeLogo";

export default function CustomerMenu() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get vendor ID and table number from URL
  const vendorId = searchParams.get('restaurant');
  const tableNumber = searchParams.get('table');
  const isAuthenticated = searchParams.get('auth') === 'true';
  const isGuest = searchParams.get('guest') === 'true';
  
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentOrder, setCurrentOrder] = useState(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [error, setError] = useState("");
  const [authError, setAuthError] = useState("");

  // Check authentication and load data
  useEffect(() => {
    checkExistingAuth();
  }, []);

  // Load menu items when vendor ID is available
  useEffect(() => {
    if (vendorId) {
      loadMenuItems();
    }
  }, [vendorId]);

  // Filter menu items when search or category changes
  useEffect(() => {
    filterMenuItems();
  }, [menuItems, searchTerm, selectedCategory]);

  // Check for Google OAuth callback parameters
  useEffect(() => {
    const token = searchParams.get('token');
    const googleAuth = searchParams.get('googleAuth');
    const userData = searchParams.get('userData');
    const error = searchParams.get('error');

    if (error) {
      setAuthError(error);
    } else if (token && googleAuth) {
      handleGoogleAuthCallback(token, userData);
    }
  }, [searchParams]);

  const checkExistingAuth = async () => {
    try {
      // Check if user is already authenticated
      const isCustomerAuth = customerAuthService.isAuthenticated();
      
      if (isCustomerAuth) {
        try {
          const currentUser = await customerAuthService.getCurrentUser();
          if (currentUser) {
          setUser(currentUser);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          // Token might be expired, clear it
          customerAuthService.clearAuth();
        }
      }

        // Check for guest session
        const guestSession = localStorage.getItem('guestSession');
        const guestTimestamp = localStorage.getItem('guestTimestamp');
      const guestVendorId = localStorage.getItem('guestVendorId');
      const guestTableNumber = localStorage.getItem('guestTableNumber');
        
      if (guestSession && guestTimestamp && guestVendorId === vendorId && guestTableNumber === tableNumber) {
          // Check if guest session is still valid (24 hours)
          const sessionAge = Date.now() - parseInt(guestTimestamp);
          if (sessionAge < 24 * 60 * 60 * 1000) {
          setIsGuestMode(true);
            setUser({ type: 'guest', name: 'Guest User' });
          setIsLoading(false);
          return;
          } else {
            // Session expired, clear it
            localStorage.removeItem('guestSession');
            localStorage.removeItem('guestTimestamp');
          localStorage.removeItem('guestVendorId');
          localStorage.removeItem('guestTableNumber');
        }
      }

      // If no existing auth, redirect to login selection page
      if (!isAuthenticated && !isGuest) {
        navigate(`/customer-login-selection?restaurant=${vendorId}&table=${tableNumber}`);
        return;
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error checking existing auth:', error);
      setIsLoading(false);
    }
  };

  const loadMenuItems = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      // Load menu items for the specific vendor
      const response = await MenuItem.list(vendorId);
      
      if (response.success) {
        setMenuItems(response.data || []);
      } else {
        setError("Failed to load menu items");
      }
    } catch (error) {
      console.error("Error loading menu items:", error);
      setError("Failed to load menu items");
    } finally {
      setIsLoading(false);
    }
  };

  const filterMenuItems = () => {
    let filtered = menuItems;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredItems(filtered);
  };

  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem._id === item._id);
      
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item._id === itemId);
      
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item._id === itemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prevCart.filter(item => item._id !== itemId);
      }
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const goToCartCheckout = () => {
    if (cart.length === 0) return;
    
    // Encode cart data for URL
    const cartData = encodeURIComponent(JSON.stringify(cart));
    navigate(`/cart-checkout?restaurant=${vendorId}&table=${tableNumber}&cart=${cartData}`);
  };


  const handleGoogleAuthCallback = async (token, userData) => {
    try {
      console.log('🔐 CustomerMenu: Google OAuth callback received');
      
      let user;
      if (userData) {
        // Parse user data from URL parameters
        try {
          user = JSON.parse(decodeURIComponent(userData));
          console.log('🔐 CustomerMenu: User data parsed from URL:', user.email);
        } catch (parseError) {
          console.error('Error parsing user data from URL:', parseError);
          user = null;
        }
      }
      
      // Store the customer token and user data using the service
      customerAuthService.setAuth(token, user);
      
      if (user) {
        console.log('🔐 CustomerMenu: Google OAuth completed successfully with user data');
        setUser(user);
        setAuthError("");
        
        // Clear URL parameters and add auth parameter
        const url = new URL(window.location);
        url.searchParams.delete('token');
        url.searchParams.delete('googleAuth');
        url.searchParams.delete('userData');
        url.searchParams.set('auth', 'true');
        window.history.replaceState({}, '', url);
      } else {
        // Fallback: try to get user profile from API
        console.log('🔐 CustomerMenu: No user data in URL, fetching from API...');
        const apiUser = await customerAuthService.getCurrentUser();
        if (apiUser) {
          console.log('🔐 CustomerMenu: User profile loaded from API successfully');
          setUser(apiUser);
          setAuthError("");
          
          // Clear URL parameters and add auth parameter
          const url = new URL(window.location);
          url.searchParams.delete('token');
          url.searchParams.delete('googleAuth');
          url.searchParams.delete('userData');
          url.searchParams.set('auth', 'true');
          window.history.replaceState({}, '', url);
        } else {
          throw new Error('Failed to load user profile');
        }
      }
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      setAuthError('Failed to authenticate with Google. Please try again.');
      
      // Clear URL parameters
      const url = new URL(window.location);
      url.searchParams.delete('token');
      url.searchParams.delete('googleAuth');
      url.searchParams.delete('userData');
      window.history.replaceState({}, '', url);
    }
  };

  const handleLogout = async () => {
    try {
      if (isGuestMode) {
        // Clear only guest session data
        localStorage.removeItem('guestSession');
        localStorage.removeItem('guestTimestamp');
        localStorage.removeItem('guestVendorId');
        localStorage.removeItem('guestTableNumber');
      } else {
        // Clear customer authentication and call backend logout
        await customerAuthService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data even if backend call fails
      customerAuthService.clearAuth();
    } finally {
      setUser(null);
      setIsGuestMode(false);
      setCart([]);
      
      // Redirect to auth page
      navigate(`/customer-auth?restaurant=${vendorId}&table=${tableNumber}`);
    }
  };

  const handleAuthRedirect = () => {
    navigate(`/customer-auth?restaurant=${vendorId}&table=${tableNumber}`);
  };

  // Generate categories dynamically from menu items
  const categories = React.useMemo(() => {
    if (!menuItems || menuItems.length === 0) {
      return ["all"];
    }
    
    // Extract unique categories from menu items
    const uniqueCategories = [...new Set(menuItems.map(item => item.category).filter(Boolean))];
    
    // Sort categories alphabetically and add "all" at the beginning
    const sortedCategories = uniqueCategories.sort();
    return ["all", ...sortedCategories];
  }, [menuItems]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (!vendorId || !tableNumber) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Invalid QR Code</h2>
          <p className="text-slate-600">This QR code is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile-specific styles */}
      <style jsx>{`
        @media (max-width: 640px) {
          .touch-target {
            min-height: 44px;
            min-width: 44px;
          }
          
          .mobile-button {
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
          }
        }
      `}</style>
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo and Restaurant Info */}
            <div className="flex items-center gap-2 sm:gap-3">
            <img src="/Main Logo_ByteMe.png" alt="ByteMe Logo" className="w-20 h-10" />
              <div>
                <p className="text-xs sm:text-sm text-brand-dark/70">Table {tableNumber}</p>
              </div>
            </div>
            
            {/* User Actions */}
            <div className="flex items-center gap-1 sm:gap-4">
              {user ? (
                <div className="flex items-center gap-1 sm:gap-3">
                  <span className="hidden sm:block text-sm text-slate-600">
                    Welcome, {user.firstName || user.name || 'Guest'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="h-10 w-10 sm:h-9 sm:w-auto sm:px-3 p-0 sm:p-2 touch-manipulation touch-target mobile-button"
                    title={isGuestMode ? 'Exit Guest Mode' : 'Sign Out'}
                  >
                    <LogOut className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">
                      {isGuestMode ? 'Exit Guest Mode' : 'Sign Out'}
                    </span>
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAuthRedirect}
                  className="h-10 w-10 sm:h-9 sm:w-auto sm:px-3 p-0 sm:p-2 touch-manipulation touch-target mobile-button"
                  title="Sign In"
                >
                  <User className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              )}

              {/* Cart Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={goToCartCheckout}
                className="relative h-10 w-10 sm:h-9 sm:w-auto sm:px-3 p-0 sm:p-2 touch-manipulation touch-target mobile-button"
                title="View Cart"
                disabled={cart.length === 0}
              >
                <ShoppingCart className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Cart</span>
                {cart.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-brand-primary text-brand-white">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Horizontally Scrollable Categories */}
          <div className="relative">
            <div className="flex overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 gap-3">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`capitalize whitespace-nowrap px-4 py-2 h-10 flex-shrink-0 transition-all duration-200 ${
                    selectedCategory === category 
                      ? 'bg-brand-primary text-brand-white shadow-md border-brand-primary' 
                      : 'bg-brand-white text-brand-dark border-slate-300 hover:bg-brand-primary/5 hover:border-brand-primary/30'
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
            
            {/* Scroll indicators */}
            <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          </div>
        )}

        {authError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {authError}
            </div>
          </div>
        )}

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <Card key={item._id} className="bg-white shadow-sm hover:shadow-md transition-all duration-200 border-0 rounded-xl overflow-hidden">
              {item.image && (
        <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 rounded-t-lg overflow-hidden">
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="hidden w-full h-full items-center justify-center text-slate-400">
            <span className="text-sm">No Image</span>
          </div>
        </div>
      )}
              <CardHeader className="pb-3 p-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg font-semibold text-slate-900 mb-1 line-clamp-2">
                      {item.name}
                    </CardTitle>
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <Badge variant="secondary" className="flex-shrink-0 bg-brand-primary/10 text-brand-primary font-bold px-2 py-1">
                    LKR {item.price}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    {item.preparationTime || '15'} min
                  </div>
                  {item.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                      <span className="text-xs sm:text-sm text-slate-600">{item.rating}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="capitalize text-xs px-2 py-1 bg-slate-50 text-slate-600 border-slate-200">
                    {item.category}
                  </Badge>
                  
                  <Button
                    size="sm"
                    onClick={() => addToCart(item)}
                    className="h-9 sm:h-9 px-3 sm:px-4 bg-brand-primary hover:bg-brand-primary/90 text-brand-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 touch-manipulation touch-target mobile-button"
                    title="Add to cart"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Add</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Items Message */}
        {filteredItems.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No menu items found</h3>
            <p className="text-slate-600">
              Try adjusting your search or category filters.
            </p>
          </div>
        )}
      </main>

      {/* Floating Cart Button (Uber Eats Style) */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-40 px-4 w-full max-w-sm">
          <Button
            onClick={goToCartCheckout}
            className="bg-brand-primary hover:bg-brand-primary/90 text-brand-white shadow-xl px-4 sm:px-6 py-3 rounded-full h-12 sm:h-14 flex items-center gap-2 sm:gap-3 w-full justify-between transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation touch-target mobile-button"
          >
            <div className="flex items-center gap-2">
              <div className="bg-white/20 rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center">
                <span className="text-sm font-bold">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <span className="font-medium text-sm sm:text-base">View Cart</span>
            </div>
            <span className="font-bold text-sm sm:text-base">LKR {getCartTotal().toFixed(2)}</span>
          </Button>
        </div>
      )}

    </div>
  );
}