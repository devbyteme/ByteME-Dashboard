import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Eye, EyeOff, Trash2 } from "lucide-react";

export default function MenuItemCard({ item, onEdit, onToggleAvailability, onDelete }) {
  const dietaryColors = {
    vegetarian: "bg-green-100 text-green-800",
    vegan: "bg-green-100 text-green-800",
    "gluten-free": "bg-blue-100 text-blue-800",
    "dairy-free": "bg-purple-100 text-purple-800",
    "nut-free": "bg-orange-100 text-orange-800",
    spicy: "bg-red-100 text-red-800"
  };

  return (
    <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg transition-all duration-200 hover:shadow-xl ${
      !item.available ? 'opacity-60' : ''
    }`}>
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
            <p className="text-xl font-bold text-blue-900 mt-1">
              LKR {item.price.toFixed(2)}
            </p>
          </div>
          <Badge 
            variant={item.category === 'mains' ? 'default' : 'secondary'}
            className="bg-blue-100 text-blue-800"
          >
            {item.category}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600 line-clamp-2">
          {item.description}
        </p>
        
        {item.dietary_info && item.dietary_info.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.dietary_info.map((info, index) => (
              <Badge 
                key={index} 
                variant="outline"
                className={`text-xs ${dietaryColors[info] || 'bg-gray-100 text-gray-800'}`}
              >
                {info}
              </Badge>
            ))}
          </div>
        )}
        
        {item.preparationTime && (
          <p className="text-xs text-slate-500">
            Prep time: {item.preparationTime} min
          </p>
        )}
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(item)}
            className="flex-1 gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          <Button
            variant={item.available ? "outline" : "default"}
            size="sm"
            onClick={() => onToggleAvailability(item)}
            className={`gap-2 ${item.available ? 'text-red-600 hover:text-red-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {item.available ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {item.available ? 'Hide' : 'Show'}
          </Button>
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(item)}
              className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}