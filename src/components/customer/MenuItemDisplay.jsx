import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Clock, Leaf, Flame } from "lucide-react";

export default function MenuItemDisplay({ item, onAddToCart, cartQuantity }) {
  const dietaryIcons = {
    vegetarian: <Leaf className="w-3 h-3 text-green-600" />,
    vegan: <Leaf className="w-3 h-3 text-green-600" />,
    spicy: <Flame className="w-3 h-3 text-red-600" />
  };

  const dietaryColors = {
    vegetarian: "bg-green-100 text-green-800",
    vegan: "bg-green-100 text-green-800",
    "gluten-free": "bg-blue-100 text-blue-800",
    "dairy-free": "bg-purple-100 text-purple-800",
    "nut-free": "bg-orange-100 text-orange-800",
    spicy: "bg-red-100 text-red-800"
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
      {item.image && (
        <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 rounded-t-lg overflow-hidden">
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="hidden w-full h-full items-center justify-center text-slate-400">
            <span className="text-sm">No Image</span>
          </div>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-slate-900">
              {item.name}
            </CardTitle>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              LKR {item.price.toFixed(2)} 
            </p>
          </div>
          {cartQuantity > 0 && (
            <Badge className="bg-blue-900 text-white">
              {cartQuantity} in cart
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          {item.description}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {item.dietary_info?.map((info, index) => (
            <Badge 
              key={index} 
              variant="outline"
              className={`text-xs ${dietaryColors[info] || 'bg-gray-100 text-gray-800'}`}
            >
              {dietaryIcons[info]}
              {info.replace('-', ' ')}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          {item.preparationTime && (
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <Clock className="w-4 h-4" />
              {item.preparationTime} min
            </div>
          )}
          
          <Button
            onClick={() => onAddToCart(item)}
            className="bg-blue-900 hover:bg-blue-800 gap-2"
          >
            <Plus className="w-4 h-4" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}