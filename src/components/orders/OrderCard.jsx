
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, Phone, CheckCircle, ArrowRight, Mail, CreditCard, Banknote, Hash, Star, AlertTriangle } from "lucide-react";
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
            <div className="flex items-center gap-3 text-sm text-slate-600 mt-1">
              <div className="flex items-center gap-1">
                <Hash className="w-3 h-3" />
                <span className="font-mono text-xs">{order.id?.slice(-8) || 'N/A'}</span>
              </div>
              <span>•</span>
              <span>{format(new Date(order.created_date), "MMM d, HH:mm")}</span>
            </div>
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
            {order.customerPhone && (
              <p className="text-slate-600 flex items-center gap-1 mt-1">
                <Phone className="w-3 h-3" />
                {order.customerPhone}
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

        {/* Payment Method */}
        {order.paymentMethod && (
          <div className="flex items-center gap-2 text-sm">
            {order.paymentMethod === 'cash' ? <Banknote className="w-4 h-4 text-green-600" /> : <CreditCard className="w-4 h-4 text-blue-600" />}
            <span className="font-medium text-slate-700">Payment:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              order.paymentMethod === 'cash' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {order.paymentMethod === 'cash' ? 'Cash' : order.paymentMethod === 'card' ? 'Card' : 'Mobile'}
            </span>
          </div>
        )}

        {/* Dietary Requirements */}
        {order.dietaryRequirements && order.dietaryRequirements.length > 0 && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Dietary Requirements:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {order.dietaryRequirements.map((req, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {req.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Special Requests */}
        {order.specialRequests && (
          <div className="p-3 bg-amber-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Star className="w-4 h-4 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">Special Requests:</p>
                <p className="text-sm text-amber-800 mt-1">{order.specialRequests}</p>
              </div>
            </div>
          </div>
        )}

        {/* Legacy notes field */}
        {order.notes && !order.specialRequests && (
          <div className="p-3 bg-amber-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Star className="w-4 h-4 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">Notes:</p>
                <p className="text-sm text-amber-800 mt-1">{order.notes}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-3 border-t">
          <div>
            {/* Show breakdown if tip exists */}
            {order.tipAmount > 0 ? (
              <div className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="text-slate-900">${(order.total_amount - order.tipAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Tip:</span>
                  <span className="text-slate-900">${order.tipAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-slate-900 border-t pt-1">
                  <span>Total:</span>
                  <span>${order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <p className="text-lg font-bold text-slate-900">
                ${order.total_amount.toFixed(2)}
              </p>
            )}
            {order.estimated_time && (
              <p className="text-sm text-slate-600 flex items-center gap-1 mt-2">
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
