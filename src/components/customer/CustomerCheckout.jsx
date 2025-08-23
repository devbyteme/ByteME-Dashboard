import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { X, CheckCircle, CreditCard, Banknote } from "lucide-react";
import { orderService } from "@/api";

export default function CustomerCheckout({ cart, tableNumber, total, user, vendorId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    customer_phone: "",
    payment_method: "cash",
    special_requests: "",
    dietary_requirements: [],
    tip_percentage: 15,
    custom_tip: ""
  });

  const dietaryOptions = [
    'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 
    'halal', 'kosher', 'low-sodium', 'spicy-mild', 'spicy-hot'
  ];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [error, setError] = useState("");

  const calculateTip = () => {
    if (formData.custom_tip) {
      return parseFloat(formData.custom_tip) || 0;
    }
    return (total * formData.tip_percentage) / 100;
  };

  const getFinalTotal = () => {
    return total + calculateTip();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    try {
      // Calculate tip amount
      const tipAmount = calculateTip();
      const tipPercentage = formData.custom_tip ? 0 : formData.tip_percentage;
      
      // Create order data for backend API
      const orderData = {
        tableNumber: parseInt(tableNumber),
        customerId: user?._id || null,
        items: cart.map(item => ({
          menuItemId: item._id, // Use _id as the backend expects menuItemId
          quantity: item.quantity,
          notes: item.notes || ""
        })),
        paymentMethod: formData.payment_method,
        tipAmount: tipAmount,
        tipPercentage: tipPercentage,
        dietaryRequirements: formData.dietary_requirements,
        specialRequests: formData.special_requests,
        customerPhone: formData.customer_phone,
        notes: [
          formData.special_requests && `Special: ${formData.special_requests}`,
          formData.dietary_requirements.length > 0 && `Dietary: ${formData.dietary_requirements.join(', ')}`,
          formData.customer_phone && `Phone: ${formData.customer_phone}`
        ].filter(Boolean).join(' | ')
      };
      
      console.log("Submitting order:", orderData);
      
      // Call backend API to create order
      const response = await orderService.create(orderData);
      
      if (response.success) {
        setOrderSubmitted(true);
        setIsSubmitting(false);
        
        // Pass the created order data to parent component
        setTimeout(() => {
          onSuccess(response.data);
        }, 3000);
      } else {
        throw new Error(response.message || "Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      setError(error.message || "Failed to create order. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (orderSubmitted) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Order Placed Successfully!</h3>
            <p className="text-slate-600 mb-4">
              Your order has been sent to the kitchen. We'll prepare it shortly.
            </p>
            <p className="text-sm text-slate-500">
              You can track your order progress above.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b border-slate-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Checkout</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Order Summary</h3>
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-slate-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-slate-700">Subtotal</p>
                    <p className="font-semibold text-slate-900">${total.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-slate-700">
                      Tip {formData.custom_tip ? '(Custom)' : formData.tip_percentage > 0 ? `(${formData.tip_percentage}%)` : ''}
                    </p>
                    <p className={`font-semibold ${calculateTip() > 0 ? 'text-green-600' : 'text-slate-900'}`}>
                      ${calculateTip().toFixed(2)}
                    </p>
                  </div>
                  {calculateTip() > 0 && (
                    <div className="text-xs text-green-600 text-center bg-green-50 py-1 px-2 rounded">
                      Thank you for supporting our team! 💚
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between items-center">
                    <p className="font-bold text-lg text-slate-900">Total</p>
                    <p className="font-bold text-lg text-blue-600">${getFinalTotal().toFixed(2)}</p>
                  </div>
                  {calculateTip() > 0 && (
                    <div className="text-xs text-slate-600 text-center">
                      Includes ${calculateTip().toFixed(2)} tip
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Your Information</h3>
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Name</span>
                  <span className="font-medium text-slate-900">{user?.firstName || "Guest"}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Email</span>
                  <span className="font-medium text-slate-900">{user?.email || "Not provided"}</span>
                </div>
                <div>
                  <Label htmlFor="customer_phone" className="text-sm mb-1 block">Phone Number (Optional)</Label>
                  <Input
                    id="customer_phone"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                    placeholder="For order updates"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Dietary Requirements</h3>
              <div className="grid grid-cols-2 gap-3">
                {dietaryOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      checked={formData.dietary_requirements.includes(option)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData(prev => ({
                            ...prev,
                            dietary_requirements: [...prev.dietary_requirements, option]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            dietary_requirements: prev.dietary_requirements.filter(req => req !== option)
                          }));
                        }
                      }}
                    />
                    <Label 
                      htmlFor={option} 
                      className="text-sm font-normal capitalize cursor-pointer"
                    >
                      {option.replace('-', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="special_requests" className="font-medium">Special Requests</Label>
              <Textarea
                id="special_requests"
                value={formData.special_requests}
                onChange={(e) => setFormData({...formData, special_requests: e.target.value})}
                placeholder="Any special cooking instructions, modifications, or requests..."
                rows={2}
                className="mt-2"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-slate-900">Add Tip</h3>
                {calculateTip() > 0 && (
                  <span className="text-sm text-green-600 font-medium">
                    +${calculateTip().toFixed(2)}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[10, 15, 18, 20].map(percentage => {
                  const tipAmount = (total * percentage) / 100;
                  return (
                    <Button
                      key={percentage}
                      type="button"
                      variant={formData.tip_percentage === percentage ? "default" : "outline"}
                      onClick={() => setFormData({...formData, tip_percentage: percentage, custom_tip: ""})}
                      className={`h-auto py-3 flex flex-col gap-1 ${formData.tip_percentage === percentage 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' 
                        : 'bg-white text-slate-900 border-slate-300 hover:bg-blue-50 hover:border-blue-300'
                      }`}
                    >
                      <span className="font-semibold">{percentage}%</span>
                      <span className="text-xs opacity-80">${tipAmount.toFixed(2)}</span>
                    </Button>
                  );
                })}
              </div>
              <div>
                <Label htmlFor="custom_tip" className="font-medium">Custom Tip Amount ($)</Label>
                <Input
                  id="custom_tip"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.custom_tip}
                  onChange={(e) => setFormData({...formData, custom_tip: e.target.value, tip_percentage: 0})}
                  placeholder="Enter custom amount"
                  className="mt-2"
                />
              </div>
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormData({...formData, tip_percentage: 0, custom_tip: ""})}
                  className="text-slate-500 hover:text-slate-700 text-sm"
                >
                  No tip
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 text-lg">Payment Method</h3>
              <div className="space-y-3">
                <div 
                  onClick={() => setFormData({...formData, payment_method: 'cash'})}
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    formData.payment_method === 'cash' 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    formData.payment_method === 'cash' ? 'border-blue-500' : 'border-slate-300'
                  }`}>
                    {formData.payment_method === 'cash' && (
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      formData.payment_method === 'cash' ? 'bg-blue-100' : 'bg-slate-100'
                    }`}>
                      <Banknote className={`w-5 h-5 ${
                        formData.payment_method === 'cash' ? 'text-blue-600' : 'text-slate-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Pay with Cash</p>
                      <p className="text-sm text-slate-600">Pay when your order arrives</p>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => setFormData({...formData, payment_method: 'card'})}
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    formData.payment_method === 'card' 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    formData.payment_method === 'card' ? 'border-blue-500' : 'border-slate-300'
                  }`}>
                    {formData.payment_method === 'card' && (
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      formData.payment_method === 'card' ? 'bg-blue-100' : 'bg-slate-100'
                    }`}>
                      <CreditCard className={`w-5 h-5 ${
                        formData.payment_method === 'card' ? 'text-blue-600' : 'text-slate-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Pay with Card</p>
                      <p className="text-sm text-slate-600">Secure online payment</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="special_requests" className="font-medium">Special Requests (Optional)</Label>
              <Textarea
                id="special_requests"
                value={formData.special_requests}
                onChange={(e) => setFormData({...formData, special_requests: e.target.value})}
                placeholder="Any special instructions for your order..."
                rows={3}
                className="mt-2"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] disabled:hover:scale-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Placing Order...
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <span>Place Order</span>
                  <span className="font-bold">${getFinalTotal().toFixed(2)}</span>
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}