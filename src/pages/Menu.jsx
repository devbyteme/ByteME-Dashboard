import React, { useState, useEffect } from "react";
import { MenuItem, Order } from "@/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Plus, Minus, UtensilsCrossed } from "lucide-react";

import MenuItemDisplay from "../components/customer/MenuItemDisplay";
import CartSidebar from "../components/customer/CartSidebar";
import OrderConfirmation from "../components/customer/OrderConfirmation";

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [tableNumber, setTableNumber] = useState("");

  useEffect(() => {
    // Get table number from URL
    const urlParams = new URLSearchParams(window.location.search);
    const tableFromUrl = window.location.hash.split('/')[2];
    setTableNumber(tableFromUrl || 'Unknown');
    
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      const response = await MenuItem.list();
      
      // Check if response is an array or has a data property
      let menuItemsArray;
      if (Array.isArray(response)) {
        menuItemsArray = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        menuItemsArray = response.data;
      } else if (response && response.success && response.data && Array.isArray(response.data)) {
        menuItemsArray = response.data;
      } else {
        console.error('Unexpected API response format:', response);
        menuItemsArray = [];
      }
      
      setMenuItems(menuItemsArray.filter(item => item.available));
    } catch (error) {
      console.error("Error loading menu items:", error);
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

  const handleCheckout = () => {
    setShowCart(false);
    setShowCheckout(true);
  };

  // Note: These are kept for backward compatibility with customer-facing menu
  // In a production app, you'd want to fetch these dynamically too
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
              </div>
            </div>
            <Button
              onClick={() => setShowCart(true)}
              className="bg-blue-900 hover:bg-blue-800 gap-2 relative"
            >
              <ShoppingCart className="w-4 h-4" />
              Cart ({cart.length})
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-amber-500 text-white">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
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
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(item => (
                    <MenuItemDisplay
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

      {/* Cart Sidebar */}
      {showCart && (
        <CartSidebar
          cart={cart}
          onClose={() => setShowCart(false)}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          onCheckout={handleCheckout}
          total={getCartTotal()}
        />
      )}

      {/* Checkout */}
      {showCheckout && (
        <OrderConfirmation
          cart={cart}
          tableNumber={tableNumber}
          total={getCartTotal()}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            setCart([]);
            setShowCheckout(false);
          }}
        />
      )}
    </div>
  );
}