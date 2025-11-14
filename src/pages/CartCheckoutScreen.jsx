import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle, 
  CreditCard, 
  Banknote,
  X
} from "lucide-react";
import { orderService, authService, tableService } from "@/api";
import ByteMeLogo from "../components/ByteMeLogo";
import ByteMeFooter from "../components/ByteMeFooter";

export default function CartCheckoutScreen() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get parameters from URL
  const vendorId = searchParams.get('restaurant');
  const tableNumber = searchParams.get('table');
  const cartData = searchParams.get('cart');
  
  // Parse cart data from URL
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [vendorInfo, setVendorInfo] = useState(null);
  
  // Checkout form state
  const [formData, setFormData] = useState({
    customer_phone: "",
    customer_email: "",
    payment_method: "cash",
    special_requests: "",
    tip_percentage: 15,
    custom_tip: ""
  });
  
  // Check if user is guest
  const isGuest = !user;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isCartInitialized, setIsCartInitialized] = useState(false);
  const [vendorBillingSettings, setVendorBillingSettings] = useState({
    taxRate: 0,
    serviceChargeRate: 0
  });
  const [tableInfo,setTableInfo] = useState(null);

  // Parse cart data on component mount
  useEffect(() => {
    if (cartData) {
      try {
        const parsedCart = JSON.parse(decodeURIComponent(cartData));
        setCart(parsedCart);
        setIsCartInitialized(true);
      } catch (error) {
        console.error('Error parsing cart data:', error);
        setError('Invalid cart data');
        setIsCartInitialized(true);
      }
    } else {
      // Fallback: try to load cart from localStorage
      try {
        const savedCart = localStorage.getItem('customerCart');
        if (savedCart) {
          const cartData = JSON.parse(savedCart);
          
          // Check if cart data is not too old (24 hours)
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
          const isExpired = cartData.timestamp && (Date.now() - cartData.timestamp) > maxAge;
          
          if (isExpired) {
            localStorage.removeItem('customerCart');
            setIsCartInitialized(true);
            return;
          }
          
          // Only restore cart if it's for the same vendor and table
          if (cartData.vendorId === vendorId && cartData.tableNumber === parseInt(tableNumber)) {
            setCart(cartData.items || []);
          }
        }
        setIsCartInitialized(true);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        setIsCartInitialized(true);
      }
    }
  }, [cartData, vendorId, tableNumber]);

  useEffect (()=>{
    if(tableNumber){
      loadTableData();
    }
  },[tableNumber]);
  
  const loadTableData = async () =>{
    try {
      console.log("did you run")
      const tableInforesponse = await tableService.getByNumber(tableNumber);
      if(tableInforesponse.success){
        setTableInfo(tableInforesponse.data);
      }
    }catch (error) {
      console.error('Error fetching table info:', error);
    }
  };
  
  // Load user and vendor data
  useEffect(() => {
    const loadUserData = () => {
      const savedUser = localStorage.getItem('customerUser');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setFormData(prev => ({
            ...prev,
            customer_phone: userData.phone || "",
            customer_email: userData.email || ""
          }));
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    };

    const loadVendorData = async () => {
      if (vendorId) {
        try {
          const response = await authService.getVendorProfile(vendorId);
          if (response.success) {
            setVendorInfo(response.data);
            if (response.data.billingSettings) {
              setVendorBillingSettings({
                taxRate: response.data.billingSettings.taxRate || 0,
                serviceChargeRate: response.data.billingSettings.serviceChargeRate || 0
              });
            }
          }
        } catch (error) {
          console.error('Error fetching vendor data:', error);
        }
      }
    };

    loadUserData();
    loadVendorData();
  }, [vendorId]);

  // Calculate totals
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return (getCartTotal() * vendorBillingSettings.taxRate) / 100;
  };

  const calculateServiceCharge = () => {
    return (getCartTotal() * vendorBillingSettings.serviceChargeRate) / 100;
  };

  const calculateTip = () => {
    const subtotal = getCartTotal() + calculateTax() + calculateServiceCharge();
    if (formData.custom_tip) {
      return parseFloat(formData.custom_tip) || 0;
    }
    return (subtotal * formData.tip_percentage) / 100;
  };

  const getFinalTotal = () => {
    return getCartTotal() + calculateTax() + calculateServiceCharge() + calculateTip();
  };

  // Sync cart changes to localStorage whenever cart changes (but only after initialization)
  useEffect(() => {
    // Don't sync until cart is initialized to avoid overwriting on initial load
    if (!isCartInitialized || !vendorId || !tableNumber) return;
    
    if (cart.length > 0) {
      const cartData = {
        vendorId,
        tableNumber: parseInt(tableNumber),
        items: cart,
        timestamp: Date.now()
      };
      localStorage.setItem('customerCart', JSON.stringify(cartData));
      console.log('Cart updated in localStorage:', cart.length, 'items');
    } else {
      // Clear localStorage if cart is empty
      localStorage.removeItem('customerCart');
      console.log('Cart cleared from localStorage (empty cart)');
    }
  }, [cart, vendorId, tableNumber, isCartInitialized]);

  // Cart management functions
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(prev => prev.map(item => 
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(item => item._id !== itemId));
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const orderData = {
        vendorId,
        tableNumber: parseInt(tableNumber),
        items: cart.map(item => ({
          menuItemId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email,
        payment_method: formData.payment_method,
        special_requests: formData.special_requests,
        tip_amount: calculateTip(),
        subtotal: getCartTotal(),
        tax_amount: calculateTax(),
        service_charge_amount: calculateServiceCharge(),
        total_amount: getFinalTotal()
      };

      const response = await orderService.create(orderData);
      
      if (response.success) {
        setOrderSubmitted(true);
        // Clear cart from localStorage and current state
        localStorage.removeItem('customerCart');
        setCart([]);
      } else {
        setError(response.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      setError(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    // Cart is automatically synced to localStorage via useEffect
    // So we can just navigate back
    navigate(`/customer-menu?restaurant=${vendorId}&table=${tableNumber}`);
  };

  if (orderSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-secondary to-brand-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center bg-white/90 backdrop-blur-sm border-brand-primary/10 shadow-lg">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-brand-dark mb-2">Order Placed Successfully!</h2>
            <p className="text-brand-dark/70 mb-6">
              Your order has been sent to the kitchen. You'll receive a confirmation shortly.
            </p>
            <Button onClick={goBack} className="w-full bg-brand-primary hover:bg-brand-primary/90 text-brand-white">
              Back to Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-secondary to-brand-white">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-brand-primary/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={goBack}
                className="hover:bg-brand-primary/10 text-brand-dark"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                {/* <img src="/Main Logo_ByteMe.png" alt="ByteMe Logo" className="w-20 aspect-[551/371] object-contain" /> */}
                {vendorInfo && vendorInfo.logo && (
                  <img src={vendorInfo.logo} alt={`${vendorInfo.name} Logo`} className="w-12 h-12 sm:w-11 sm:h-11 rounded-lg object-cover" />
                )}
                <div>
                  <h1 className="text-lg font-semibold text-brand-dark">
                    {vendorInfo?.name || 'Restaurant'}
                  </h1>
                  <p className="text-sm text-brand-dark/70">Table {tableNumber}</p>
                  {
                    tableInfo && tableInfo.location && (
                      <p className="text-sm text-brand-dark/70"> {tableInfo.location}</p>
                    )
                  }
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-sm border-brand-primary text-brand-primary">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} items
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cart Section */}
          <div className="space-y-4">
            <Card className="bg-white/90 backdrop-blur-sm border-brand-primary/10 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5">
                <CardTitle className="flex items-center gap-2 text-brand-dark">
                  <ShoppingCart className="w-5 h-5 text-brand-primary" />
                  Your Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-brand-primary/30 mx-auto mb-4" />
                    <p className="text-brand-dark/70">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item._id} className="p-4 bg-brand-secondary/20 rounded-lg border border-brand-primary/10">
                        {/* Item Info Row */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0 pr-2">
                            <h3 className="font-semibold text-brand-dark text-sm sm:text-base leading-tight break-words">
                              {item.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-brand-dark/70 mt-1">
                              LKR {item.price} each
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item._id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0 w-8 h-8"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {/* Quantity and Total Row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="w-8 h-8 border-brand-primary/30 hover:bg-brand-primary/10 text-brand-dark"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="font-semibold px-2 min-w-[2rem] text-center text-brand-dark text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="w-8 h-8 border-brand-primary/30 hover:bg-brand-primary/10 text-brand-dark"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-bold text-brand-dark text-sm sm:text-base">
                              LKR {(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Checkout Section */}
          <div className="space-y-4">
            <Card className="bg-white/90 backdrop-blur-sm border-brand-primary/10 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5">
                <CardTitle className="text-brand-dark">Checkout Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Contact Information */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-brand-dark">Contact Information</h3>
                    <div>
                      <Label htmlFor="customer_phone" className="text-brand-dark">Phone Number</Label>
                      <Input
                        id="customer_phone"
                        name="customer_phone"
                        type="tel"
                        value={formData.customer_phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                        className="border-brand-primary/30 focus:border-brand-primary focus:ring-brand-primary/20"
                      />
                    </div>
                    {isGuest && (
                      <div>
                        <Label htmlFor="customer_email" className="text-brand-dark">
                          Email *
                        </Label>
                        <Input
                          id="customer_email"
                          name="customer_email"
                          type="email"
                          value={formData.customer_email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          className="border-brand-primary/30 focus:border-brand-primary focus:ring-brand-primary/20"
                          required
                        />
                        <p className="text-xs text-brand-dark/60 mt-1">
                          Email is required for guest orders to receive order updates
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-brand-dark">Payment Method</h3>
                    <RadioGroup
                      value={formData.payment_method}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cash" id="cash" className="border-brand-primary text-brand-primary" />
                        <Label htmlFor="cash" className="flex items-center gap-2 text-brand-dark">
                          <Banknote className="w-4 h-4" />
                          Cash
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="card" id="card" className="border-brand-primary text-brand-primary" />
                        <Label htmlFor="card" className="flex items-center gap-2 text-brand-dark">
                          <CreditCard className="w-4 h-4" />
                          Card
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Special Requests */}
                  <div>
                    <Label htmlFor="special_requests" className="text-brand-dark">Special Requests (Optional)</Label>
                    <Textarea
                      id="special_requests"
                      name="special_requests"
                      value={formData.special_requests}
                      onChange={handleInputChange}
                      placeholder="Any special instructions for your order..."
                      rows={3}
                      className="border-brand-primary/30 focus:border-brand-primary focus:ring-brand-primary/20"
                    />
                  </div>

                  {/* Tip Selection */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-brand-dark">Tip</h3>
                    <div className="grid grid-cols-4 gap-2">
                      <Button
                        type="button"
                        variant={formData.tip_percentage === 0 ? "default" : "outline"}
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          tip_percentage: 0,
                          custom_tip: ""
                        }))}
                        className={`text-sm ${
                          formData.tip_percentage === 0 
                            ? 'bg-brand-primary hover:bg-brand-primary/90 text-brand-white' 
                            : 'border-brand-primary/30 text-brand-dark hover:bg-brand-primary/10'
                        }`}
                      >
                        No Tip
                      </Button>
                      {[10, 15, 20].map((percentage) => (
                        <Button
                          key={percentage}
                          type="button"
                          variant={formData.tip_percentage === percentage ? "default" : "outline"}
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            tip_percentage: percentage,
                            custom_tip: ""
                          }))}
                          className={`text-sm ${
                            formData.tip_percentage === percentage 
                              ? 'bg-brand-primary hover:bg-brand-primary/90 text-brand-white' 
                              : 'border-brand-primary/30 text-brand-dark hover:bg-brand-primary/10'
                          }`}
                        >
                          {percentage}%
                        </Button>
                      ))}
                    </div>
                    <div>
                      <Input
                        name="custom_tip"
                        value={formData.custom_tip}
                        onChange={handleInputChange}
                        placeholder="Custom tip amount (LKR)"
                        type="number"
                        step="0.01"
                        min="0"
                        className="border-brand-primary/30 focus:border-brand-primary focus:ring-brand-primary/20"
                      />
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t border-brand-primary/20 pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-brand-dark">
                      <span>Subtotal</span>
                      <span>LKR {getCartTotal().toFixed(2)}</span>
                    </div>
                    {calculateTax() > 0 && (
                      <div className="flex justify-between text-sm text-brand-dark">
                        <span>Tax ({vendorBillingSettings.taxRate}%)</span>
                        <span>LKR {calculateTax().toFixed(2)}</span>
                      </div>
                    )}
                    {calculateServiceCharge() > 0 && (
                      <div className="flex justify-between text-sm text-brand-dark">
                        <span>Service Charge ({vendorBillingSettings.serviceChargeRate}%)</span>
                        <span>LKR {calculateServiceCharge().toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-brand-dark">
                      <span>Tip</span>
                      <span>LKR {calculateTip().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-brand-primary/20 pt-2 text-brand-dark">
                      <span>Total</span>
                      <span className="text-brand-primary">LKR {getFinalTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || cart.length === 0}
                    className="w-full bg-brand-primary hover:bg-brand-primary/90 text-brand-white py-3 font-semibold"
                  >
                    {isSubmitting ? 'Placing Order...' : 'Place Order'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <ByteMeFooter />
    </div>
  );
}
