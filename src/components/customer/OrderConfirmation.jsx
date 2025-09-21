
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Order } from "@/api";
import { CheckCircle, ArrowLeft, CreditCard } from "lucide-react";

export default function OrderConfirmation({ cart, tableNumber, total, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    customer_first_name: "",
    customer_last_name: "",
    customer_email: "",
    customer_phone: "",
    special_requests: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const orderData = {
        table_number: tableNumber,
        customer_first_name: formData.customer_first_name,
        customer_last_name: formData.customer_last_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        special_requests: formData.special_requests,
        items: cart.map(item => ({
          menu_item_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total_amount: total,
        status: "pending",
        estimated_time: Math.max(...cart.map(item => item.preparation_time || 15))
      };
      
      await Order.create(orderData);
      setOrderSubmitted(true);
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        onSuccess();
      }, 3000);
      
    } catch (error) {
      console.error("Error submitting order:", error);
    } finally {
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
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Placed!</h2>
            <p className="text-slate-600 mb-4">
              Your order has been sent to the kitchen. We'll bring it to Table {tableNumber} shortly.
            </p>
            <p className="text-lg font-semibold text-blue-900">
              Order Total: LKR {total.toFixed(2)}
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
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Confirm Your Order
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Order Summary */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Order Summary</h3>
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span>LKR {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 font-semibold">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span>LKR {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Customer Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_first_name">First Name</Label>
                  <Input
                    id="customer_first_name"
                    value={formData.customer_first_name}
                    onChange={(e) => setFormData({...formData, customer_first_name: e.target.value})}
                    placeholder="Enter your first name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="customer_last_name">Last Name</Label>
                  <Input
                    id="customer_last_name"
                    value={formData.customer_last_name}
                    onChange={(e) => setFormData({...formData, customer_last_name: e.target.value})}
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_email">Email Address (Optional)</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                    placeholder="Your email"
                  />
                </div>
                
                <div>
                  <Label htmlFor="customer_phone">Phone Number (Optional)</Label>
                  <Input
                    id="customer_phone"
                    type="tel"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                    placeholder="Your phone number"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="special_requests">Special Requests (Optional)</Label>
                <Textarea
                  id="special_requests"
                  value={formData.special_requests}
                  onChange={(e) => setFormData({...formData, special_requests: e.target.value})}
                  placeholder="Any special requests or allergies?"
                  rows={3}
                />
              </div>
            </div>
            
            {/* Table Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-1">Delivery Details</h3>
              <p className="text-sm text-blue-800">
                Your order will be delivered to <strong>Table {tableNumber}</strong>
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-900 hover:bg-blue-800"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
