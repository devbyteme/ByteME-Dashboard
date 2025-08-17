
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, Phone, CheckCircle, ArrowRight, Mail, CreditCard, Banknote } from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  preparing: "bg-purple-100 text-purple-800 border-purple-200",
  ready: "bg-green-100 text-green-800 border-green-200",
  served: "bg-gray-100 text-gray-800 border-gray-200",
  cancelled: "bg-red-100 text-red-800 border-red-200"
};

const nextStatus = {
  pending: "preparing",
  preparing: "ready",
  ready: "served"
};

export default function OrderCard({ order, onStatusUpdate }) {
  const handleStatusUpdate = () => {
    const next = nextStatus[order.status];
    if (next) {
      onStatusUpdate(order.id, next);
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Table {order.table_number}
            </CardTitle>
            <p className="text-sm text-slate-600">
              {format(new Date(order.created_date), "MMM d, HH:mm")}
            </p>
          </div>
          <Badge className={`${statusColors[order.status]} border`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {(order.customer_first_name || order.customer_name) && (
          <div className="text-sm">
            <p className="font-medium text-slate-900">
              {order.customer_first_name ? `${order.customer_first_name} ${order.customer_last_name}` : order.customer_name}
            </p>
            {order.customer_phone && (
              <p className="text-slate-600 flex items-center gap-1 mt-1">
                <Phone className="w-3 h-3" />
                {order.customer_phone}
              </p>
            )}
            {order.customer_email && (
              <p className="text-slate-600 flex items-center gap-1 mt-1">
                <Mail className="w-3 h-3" />
                {order.customer_email}
              </p>
            )}
            {order.payment_method && (
              <p className="text-slate-600 flex items-center gap-1 mt-1">
                {order.payment_method === 'cash' ? <Banknote className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                {order.payment_method === 'cash' ? 'Pay with Cash' : 'Card Payment'}
              </p>
            )}
          </div>
        )}
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-900">Order Items:</p>
          <div className="space-y-1">
            {order.items?.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-slate-600">
                  {item.quantity}x {item.name}
                </span>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        
        {order.special_requests && (
          <div className="p-3 bg-amber-50 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Special Requests:</strong> {order.special_requests}
            </p>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-3 border-t">
          <div>
            <p className="text-lg font-bold text-slate-900">
              ${order.total_amount.toFixed(2)}
            </p>
            {order.estimated_time && (
              <p className="text-sm text-slate-600 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {order.estimated_time} min
              </p>
            )}
          </div>
          
          {nextStatus[order.status] && (
            <Button 
              onClick={handleStatusUpdate}
              size="sm"
              className="gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              Mark as {nextStatus[order.status]}
            </Button>
          )}
          
          {order.status === 'served' && (
            <Badge className="bg-green-100 text-green-800 border border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Complete
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
