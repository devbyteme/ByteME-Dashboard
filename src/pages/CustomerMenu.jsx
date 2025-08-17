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
import CustomerCheckout from "@/components/customer/CustomerCheckout";

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
  const [showCart, setShowCart] = useState(false);
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

      // If no existing auth, redirect to auth page
      if (!isAuthenticated && !isGuest) {
        navigate(`/customer-auth?restaurant=${vendorId}&table=${tableNumber}`);
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

  const [showCheckout, setShowCheckout] = useState(false);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    // Show checkout modal instead of navigating
    setShowCheckout(true);
    setShowCart(false);
  };

  const handleCheckoutSuccess = (orderData) => {
    // Clear cart and close modals
    setCart([]);
    setShowCheckout(false);
    setShowCart(false);
    
    // Show order confirmation or redirect
    setCurrentOrder(orderData);
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

  const handleLogout = () => {
    if (isGuestMode) {
      // Clear guest session
    localStorage.removeItem('guestSession');
    localStorage.removeItem('guestTimestamp');
      localStorage.removeItem('guestVendorId');
      localStorage.removeItem('guestTableNumber');
    } else {
      // Clear customer authentication
      customerAuthService.clearAuth();
    }
    
    setUser(null);
    setIsGuestMode(false);
    setCart([]);
    
    // Redirect to auth page
    navigate(`/customer-auth?restaurant=${vendorId}&table=${tableNumber}`);
  };

  const handleAuthRedirect = () => {
    navigate(`/customer-auth?restaurant=${vendorId}&table=${tableNumber}`);
  };

  const categories = ["all", "appetizers", "mains", "desserts", "beverages", "wine", "cocktails", "coffee"];

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
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Restaurant Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-800 to-amber-500 rounded-xl flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">QR Dining</h1>
                <p className="text-sm text-slate-600">Table {tableNumber}</p>
              </div>
            </div>
            
            {/* User Actions */}
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600">
                    Welcome, {user.firstName || user.name || 'Guest'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {isGuestMode ? 'Exit Guest Mode' : 'Sign Out'}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAuthRedirect}
                >
                  <User className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
              )}

              {/* Cart Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCart(!showCart)}
                className="relative"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart
                {cart.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
        </div>
      </div>

            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Card key={item._id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-slate-900 mb-1">
                      {item.name}
                    </CardTitle>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    ${item.price}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    {item.preparationTime || '15'} min
                  </div>
                  {item.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-slate-600">{item.rating}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="capitalize">
                    {item.category}
                  </Badge>
                  
                  <Button
                    size="sm"
                    onClick={() => addToCart(item)}
                    className="h-8 px-3"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
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
      {cart.length > 0 && !showCart && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
          <Button
            onClick={() => setShowCart(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-6 py-3 rounded-full h-12 flex items-center gap-3 min-w-[200px] justify-between transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center gap-2">
              <div className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center">
                <span className="text-sm font-bold">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <span className="font-medium">View Cart</span>
            </div>
            <span className="font-bold">${getCartTotal().toFixed(2)}</span>
          </Button>
        </div>
      )}

            {/* Enhanced Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-md h-[85vh] rounded-t-2xl flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Cart Header */}
            <div className="border-b border-slate-200 p-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Your Order</h2>
                <p className="text-sm text-slate-600">Table {tableNumber} • {cart.reduce((sum, item) => sum + item.quantity, 0)} items</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCart(false)}
                className="h-10 w-10 hover:bg-white/50 rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg">Your cart is empty</p>
                  <p className="text-slate-400 text-sm">Add some delicious items to get started!</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item._id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 text-lg">{item.name}</h3>
                        <p className="text-slate-600 text-sm mt-1 line-clamp-2">{item.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-lg font-bold text-blue-600">${item.price}</span>
                          <span className="text-sm text-slate-500">each</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 bg-slate-100 rounded-full p-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromCart(item._id)}
                          className="h-8 w-8 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        
                        <span className="w-8 text-center font-bold text-slate-900 text-lg">
                          {item.quantity}
                        </span>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => addToCart(item)}
                          className="h-8 w-8 rounded-full hover:bg-green-100 hover:text-green-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-slate-900 text-lg">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Summary & Checkout */}
            {cart.length > 0 && (
              <div className="border-t border-slate-200 bg-slate-50 p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-slate-700">
                    <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span className="font-semibold">${getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span>Estimated time</span>
                    <span className="font-semibold">20-30 min</span>
                  </div>
                </div>
                
                <div className="border-t border-slate-300 pt-3">
                  <div className="flex justify-between items-center text-xl font-bold text-slate-900 mb-4">
                    <span>Total</span>
                    <span className="text-blue-600">${getCartTotal().toFixed(2)}</span>
                  </div>
                  
                  <Button
                    onClick={handleCheckout}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
                    disabled={cart.length === 0}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Go to Checkout
                  </Button>
                </div>
              </div>
            )}
          </div>
      </div>
      )}

      {/* Enhanced Checkout Modal */}
      {showCheckout && (
        <CustomerCheckout
          cart={cart}
          tableNumber={tableNumber}
          total={getCartTotal()}
          user={user}
          vendorId={vendorId}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </div>
  );
}