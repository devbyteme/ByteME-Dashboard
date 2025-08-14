import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, X, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingCart({ cart, onUpdateQuantity, onRemoveItem, onCheckout, total, itemCount }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-w-sm"
      >
        {/* Cart Header - Always Visible */}
        <div 
          className="bg-blue-900 text-white p-4 cursor-pointer flex items-center justify-between"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              <Badge className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                {itemCount}
              </Badge>
            </div>
            <div>
              <p className="font-semibold">Your Order</p>
              <p className="text-sm text-blue-100">${total.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </div>
        </div>

        {/* Expandable Cart Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="max-h-80 overflow-y-auto p-4">
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 text-sm">{item.name}</h4>
                          <p className="text-xs text-slate-600">${item.price.toFixed(2)} each</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-1 h-auto"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="font-medium px-2 text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <p className="font-bold text-slate-900 text-sm">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-slate-900">Total:</span>
                    <span className="text-xl font-bold text-blue-900">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                  
                  <Button 
                    onClick={onCheckout}
                    className="w-full bg-blue-900 hover:bg-blue-800 text-white py-2"
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Checkout Button - When Collapsed */}
        {!isExpanded && (
          <div className="p-3 border-t border-slate-200">
            <Button 
              onClick={onCheckout}
              className="w-full bg-blue-900 hover:bg-blue-800 text-white text-sm py-2"
            >
              Checkout
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}