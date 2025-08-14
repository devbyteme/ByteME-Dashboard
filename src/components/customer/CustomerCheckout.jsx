import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X, CheckCircle, CreditCard, Banknote } from "lucide-react";
import { orderService } from "@/api";

export default function CustomerCheckout({ cart, tableNumber, total, user, vendorId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    customer_phone: "",
    payment_method: "cash",
    special_requests: "",
    dietary_requirements: "",
    tip_percentage: 15,
    custom_tip: ""
  });
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
      // Create order data for backend API
      const orderData = {
        tableNumber: tableNumber,
        vendorId: vendorId,
        items: cart.map(item => ({
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          notes: item.notes || ""
        })),
        totalAmount: getFinalTotal(),
        notes: formData.special_requests || "",
        paymentMethod: formData.payment_method,
        estimatedPreparationTime: 20, // Default 20 minutes
        customerPhone: formData.customer_phone || "",
        dietaryRequirements: formData.dietary_requirements || ""
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
                    <p className="text-slate-700">Tip</p>
                    <p className="font-semibold text-slate-900">${calculateTip().toFixed(2)}</p>
                  </div>
                  <div className="border-t pt-2 flex justify-between items-center">
                    <p className="font-bold text-lg text-slate-900">Total</p>
                    <p className="font-bold text-lg text-blue-800">${getFinalTotal().toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Your Information</h3>
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Name</span>
                  <span className="font-medium text-slate-900">{user?.full_name || "Guest"}</span>
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

            <div>
              <Label htmlFor="dietary_requirements" className="font-medium">Dietary Requirements</Label>
              <Textarea
                id="dietary_requirements"
                value={formData.dietary_requirements}
                onChange={(e) => setFormData({...formData, dietary_requirements: e.target.value})}
                placeholder="Any allergies, vegetarian, vegan, gluten-free requirements..."
                rows={2}
                className="mt-2"
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Add Tip</h3>
              <div className="grid grid-cols-4 gap-2">
                {[10, 15, 18, 20].map(percentage => (
                  <Button
                    key={percentage}
                    type="button"
                    variant={formData.tip_percentage === percentage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData({...formData, tip_percentage: percentage, custom_tip: ""})}
                    className={formData.tip_percentage === percentage 
                      ? 'bg-blue-800 hover:bg-blue-700 text-white' 
                      : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-50'
                    }
                  >
                    {percentage}%
                  </Button>
                ))}
              </div>
              <div>
                <Label htmlFor="custom_tip" className="font-medium">Custom Tip Amount ($)</Label>
                <Input
                  id="custom_tip"
                  type="number"
                  step="0.01"
                  value={formData.custom_tip}
                  onChange={(e) => setFormData({...formData, custom_tip: e.target.value, tip_percentage: 0})}
                  placeholder="Enter custom amount"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Payment Method</h3>
              <RadioGroup 
                value={formData.payment_method} 
                onValueChange={(value) => setFormData({...formData, payment_method: value})}
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg bg-white">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Banknote className="w-4 h-4" />
                    Pay with Cash
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg bg-white">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                    <CreditCard className="w-4 h-4" />
                    Pay with Card
                  </Label>
                </div>
              </RadioGroup>
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
              className="w-full h-12 text-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Placing Order..." : `Place Order - $${getFinalTotal().toFixed(2)}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}