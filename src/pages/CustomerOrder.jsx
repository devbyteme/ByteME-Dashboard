
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, User as UserIcon, LogOut, Clock, CheckCircle, AlertCircle, ChefHat, Truck, CheckSquare } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { menuService, orderService } from "@/api";

import CustomerMenuItemCard from "../components/customer/CustomerMenuItemCard";
import FloatingCart from "../components/customer/FloatingCart";
import CustomerCheckout from "../components/customer/CustomerCheckout";

// Order progress tracking component
const OrderProgress = ({ order }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'preparing':
        return <ChefHat className="w-5 h-5 text-blue-500" />;
      case 'ready':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'served':
        return <CheckSquare className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'served':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Order Received';
      case 'preparing':
        return 'Preparing Your Food';
      case 'ready':
        return 'Ready for Pickup';
      case 'served':
        return 'Order Completed';
      case 'cancelled':
        return 'Order Cancelled';
      default:
        return 'Unknown Status';
    }
  };

  if (!order) return null;

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Clock className="w-5 h-5" />
          Order Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(order.status)}
              <div>
                <p className={`font-medium ${getStatusColor(order.status)} px-3 py-1 rounded-full text-sm`}>
                  {getStatusText(order.status)}
                </p>
                <p className="text-sm text-slate-600">
                  Order #{order._id?.slice(-8) || order.id?.slice(-8)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-slate-900">LKR {order.totalAmount?.toFixed(2) || '0.00'}</p>
              <p className="text-sm text-slate-600">
                {order.estimatedPreparationTime ? `${order.estimatedPreparationTime} min` : 'Time not specified'}
              </p>
            </div>
          </div>
          
          {order.notes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Notes:</strong> {order.notes}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-sm font-medium text-slate-700">Order Items</p>
              <div className="mt-2 space-y-1">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span className="text-slate-600">LKR {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-sm font-medium text-slate-700">Order Details</p>
              <div className="mt-2 space-y-1 text-sm text-slate-600">
                <p>Table: {order.tableNumber}</p>
                <p>Payment: {order.paymentStatus}</p>
                <p>Method: {order.paymentMethod}</p>
                <p>Created: {new Date(order.createdAt).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function CustomerOrder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [restaurantId, setRestaurantId] = useState("");
  const [user, setUser] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {
    // Get parameters from URL
    const tableFromParams = searchParams.get('table');
    const restaurantFromParams = searchParams.get('restaurant');
    
    setTableNumber(tableFromParams || 'Unknown');
    setRestaurantId(restaurantFromParams || '');
    
    if (restaurantFromParams) {
      loadMenuItems(restaurantFromParams);
      loadCurrentOrder(tableFromParams, restaurantFromParams);
    } else {
      setIsLoading(false);
    }
  }, [searchParams]);

  const loadMenuItems = async (vendorId) => {
    try {
      setIsLoading(true);
      const response = await menuService.getAll(vendorId);
      if (response.success) {
        setMenuItems(response.data || []);
      } else {
        console.error("Failed to load menu items:", response.message);
      }
    } catch (error) {
      console.error("Error loading menu items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentOrder = async (tableNumber, vendorId) => {
    try {
      setOrderLoading(true);
      const response = await orderService.getByTable(tableNumber);
      if (response.success && response.data && response.data.length > 0) {
        // Get the most recent order for this table
        const latestOrder = response.data[0];
        if (latestOrder.vendorId === vendorId && 
            ['pending', 'preparing', 'ready'].includes(latestOrder.status)) {
          setCurrentOrder(latestOrder);
        }
      }
    } catch (error) {
      console.error("Error loading current order:", error);
    } finally {
      setOrderLoading(false);
    }
  };

  const addToCart = (item) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item._id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { 
        id: item._id, 
        name: item.name, 
        price: item.price, 
        quantity: 1,
        notes: ''
      }];
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

  const handleOrderSuccess = async (orderData) => {
    setCart([]);
    setShowCheckout(false);
    setCurrentOrder(orderData);
    
    // Refresh the order list
    if (tableNumber && restaurantId) {
      await loadCurrentOrder(tableNumber, restaurantId);
    }
  };

  const handleLogout = () => {
    // This is a placeholder for logout.
    // In your app, you might clear a token and redirect.
    console.log("Logout clicked (placeholder)");
    alert("Logout functionality is disabled in this disconnected version.");
  };

  // Generate categories dynamically from menu items
  const categories = React.useMemo(() => {
    if (!menuItems || menuItems.length === 0) {
      return [{ value: "all", label: "All" }];
    }
    
    // Extract unique categories from menu items
    const uniqueCategories = [...new Set(menuItems.map(item => item.category).filter(Boolean))];
    
    // Sort categories alphabetically and add "all" at the beginning
    const sortedCategories = uniqueCategories.sort();
    return [
      { value: "all", label: "All" },
      ...sortedCategories.map(category => ({
        value: category,
        label: category.charAt(0).toUpperCase() + category.slice(1)
      }))
    ];
  }, [menuItems]);

  const filteredItems = activeCategory === "all" 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header with Cover Image */}
      <div className="relative h-40 sm:h-48 md:h-64 bg-gradient-to-r from-blue-800 via-blue-700 to-amber-600 overflow-hidden">
        {/* Cover Image */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop&crop=center"
            alt="Restaurant Interior"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        
        {/* Overlay Content */}
        <div className="relative z-10 h-full flex flex-col justify-between p-3 sm:p-4 md:p-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 sm:w-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Fine Dining Experience</h1>
                <p className="text-white/80 text-xs sm:text-sm">Table {tableNumber}</p>
                {restaurantId && (
                  <p className="text-white/60 text-xs">Restaurant ID: {restaurantId}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {user && (
                <Link to={createPageUrl("CustomerProfile")}>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
                    <UserIcon className="w-4 h-4" />
                    <span className="hidden sm:inline ml-2">{user.full_name}</span>
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-white/20">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Welcome Message */}
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-1 sm:mb-2">Welcome to Our Menu</h2>
            <p className="text-white/90 text-xs sm:text-sm md:text-base">Discover our carefully crafted dishes made with the finest ingredients</p>
          </div>
        </div>
      </div>

      {/* Order Progress Section */}
      {currentOrder && (
        <OrderProgress order={currentOrder} />
      )}

      {/* Category Navigation */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
            {categories.map(category => (
              <Button
                key={category.value}
                variant={activeCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category.value)}
                className={`whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 py-2 ${
                  activeCategory === category.value 
                    ? 'bg-blue-800 text-white hover:bg-blue-700' 
                    : 'bg-white text-slate-700 hover:bg-blue-50 border-slate-300'
                }`}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-32">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-800 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading menu...</p>
          </div>
        ) : (
          <div>
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                {categories.find(cat => cat.value === activeCategory)?.label}
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} available
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredItems.map(item => (
                <CustomerMenuItemCard
                  key={item._id}
                  item={item}
                  onAddToCart={addToCart}
                  cartQuantity={cart.find(cartItem => cartItem.id === item._id)?.quantity || 0}
                />
              ))}
            </div>
            
            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500">No items available in this category</p>
              </div>
            )}
          </div>
        )}
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
          vendorId={restaurantId}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleOrderSuccess}
        />
        )}
    </div>
  );
}
