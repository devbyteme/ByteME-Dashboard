import React, { useState, useEffect } from "react";
import { MenuItem, Order, User } from "@/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Plus, Minus, UtensilsCrossed, User as UserIcon, LogOut, AlertCircle } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";

import CustomerMenuItemCard from "../components/customer/CustomerMenuItemCard";
import FloatingCart from "../components/customer/FloatingCart";
import CustomerCheckout from "../components/customer/CustomerCheckout";

export default function CustomerMenu() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [restaurantId, setRestaurantId] = useState("");
  const [user, setUser] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    // Get parameters from URL
    const tableFromParams = searchParams.get('table');
    const restaurantFromParams = searchParams.get('restaurant');
    
    console.log('URL Parameters:', { table: tableFromParams, restaurant: restaurantFromParams });
    
    setTableNumber(tableFromParams || 'Unknown');
    setRestaurantId(restaurantFromParams || '');
    
    // Load menu items directly with the URL parameter value
    if (restaurantFromParams) {
      console.log('Loading menu items from URL parameter:', restaurantFromParams);
      loadMenuItems(restaurantFromParams);
    } else {
      console.log('No restaurant ID in URL parameters');
    }
    
    checkAuth();
  }, [searchParams]);

  // Watch for restaurantId changes and reload menu items
  useEffect(() => {
    if (restaurantId) {
      console.log('Restaurant ID state changed, reloading menu items:', restaurantId);
      loadMenuItems(restaurantId);
    }
  }, [restaurantId]);

  const checkAuth = async () => {
    try {
      // Check if user is authenticated
      const isAuthenticated = User.isAuthenticated();
      
      if (isAuthenticated) {
        try {
          const currentUser = await User.me();
          setUser(currentUser);
        } catch (error) {
          // Token might be expired, clear it
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setUser(null);
        }
      } else {
        // Check for guest session
        const guestSession = localStorage.getItem('guestSession');
        const guestTimestamp = localStorage.getItem('guestTimestamp');
        
        if (guestSession && guestTimestamp) {
          // Check if guest session is still valid (24 hours)
          const sessionAge = Date.now() - parseInt(guestTimestamp);
          if (sessionAge < 24 * 60 * 60 * 1000) {
            setUser({ type: 'guest', name: 'Guest User' });
          } else {
            // Session expired, clear it
            localStorage.removeItem('guestSession');
            localStorage.removeItem('guestTimestamp');
          }
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setAuthError("Authentication error. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const loadMenuItems = async (restaurantId) => {
    try {
      console.log('Loading menu items for restaurant ID:', restaurantId);
      
      let items;
      if (restaurantId) {
        console.log('Fetching vendor-specific menu items...');
        items = await MenuItem.list(restaurantId);
      } else {
        console.log('No restaurant ID provided, fetching all menu items...');
        items = await MenuItem.list();
      }
      
      console.log('API response:', items);
      
      // Check if items is an array or has a data property
      let menuItemsArray;
      if (Array.isArray(items)) {
        menuItemsArray = items;
      } else if (items && items.data && Array.isArray(items.data)) {
        menuItemsArray = items.data;
      } else if (items && items.success && items.data && Array.isArray(items.data)) {
        menuItemsArray = items.data;
      } else {
        console.error('Unexpected API response format:', items);
        menuItemsArray = [];
      }
      
      console.log('Processed menu items array:', menuItemsArray);
      console.log('Filtered available items:', menuItemsArray.filter(item => item.available));
      
      // Filter available items and set menu
      setMenuItems(menuItemsArray.filter(item => item.available));
    } catch (error) {
      console.error("Error loading menu items:", error);
      setAuthError("Failed to load menu. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (item) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handleOrderSuccess = () => {
    setCart([]);
    setShowCheckout(false);
  };

  const handleSignIn = () => {
    const currentUrl = window.location.href;
    navigate(`/user-login?restaurant=${restaurantId}&table=${tableNumber}`);
  };

  const handleSignUp = () => {
    const currentUrl = window.location.href;
    navigate(`/user-registration?restaurant=${restaurantId}&table=${tableNumber}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('guestSession');
    localStorage.removeItem('guestTimestamp');
    setUser(null);
    navigate('/user-login');
  };

  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  const categories = ["appetizers", "mains", "desserts", "beverages", "wine", "cocktails", "coffee"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-900 to-amber-500 rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Our Menu</h1>
                <p className="text-sm text-slate-600">Table {tableNumber}</p>
                {restaurantId && (
                  <p className="text-xs text-slate-500">Restaurant ID: {restaurantId}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <UserIcon className="w-4 h-4" />
                  <span>Welcome, {user.name || user.full_name || 'Guest'}</span>
                  {user.type === 'guest' && (
                    <Badge variant="secondary" className="text-xs">Guest</Badge>
                  )}
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleSignIn}>
                    Sign In
                  </Button>
                  <Button size="sm" onClick={handleSignUp}>
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {authError && (
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{authError}</span>
          </div>
        </div>
      )}

      {/* Menu Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 pb-32">
        <Tabs defaultValue="appetizers" className="w-full">
          <TabsList className="grid w-full grid-cols-7 bg-white/80 backdrop-blur-sm mb-8">
            {categories.map(category => (
              <TabsTrigger
                key={category}
                value={category}
                className="data-[state=active]:bg-blue-900 data-[state=active]:text-white"
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(category => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems
                  .filter(item => item.category === category)
                  .map(item => (
                    <CustomerMenuItemCard
                      key={item.id}
                      item={item}
                      onAddToCart={addToCart}
                      cartQuantity={cart.find(cartItem => cartItem.id === item.id)?.quantity || 0}
                    />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Floating Cart */}
      <FloatingCart
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
        total={getCartTotal()}
        itemCount={getCartItemCount()}
      />

      {/* Checkout */}
      {showCheckout && (
        <CustomerCheckout
          cart={cart}
          tableNumber={tableNumber}
          total={getCartTotal()}
          user={user}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleOrderSuccess}
        />
      )}
    </div>
  );
}