import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

import MenuItemCard from "../components/menu/MenuItemCard";
import MenuItemForm from "../components/menu/MenuItemForm";
import MenuStats from "../components/menu/MenuStats";
import { menuService } from "@/api";
import { User } from "@/api";

export default function MenuManagement() {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [error, setError] = useState("");
  const [vendor, setVendor] = useState(null);

  // Check authentication and load vendor data
  useEffect(() => {
    checkAuth();
  }, []);

  // Test backend connectivity
  useEffect(() => {
    const testBackend = async () => {
      try {
        console.log("Testing backend connectivity...");
        const response = await fetch('http://localhost:3000/api');
        console.log("Backend test response:", response);
      } catch (error) {
        console.error("Backend connectivity test failed:", error);
      }
    };
    
    testBackend();
  }, []);

  const checkAuth = async () => {
    try {
      console.log("Checking authentication...");
      // Check if user is authenticated
      const isAuthenticated = User.isAuthenticated();
      console.log("Is authenticated:", isAuthenticated);
      
      if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to login");
        navigate('/vendor-login');
        return;
      }

      // Get current user (should be vendor)
      console.log("Getting current user...");
      const currentUser = await User.me();
      console.log("Current user:", currentUser);
      
      // Check if user exists (vendors don't have a role field, they're identified by their model type)
      if (!currentUser) {
        console.log("No current user found");
        setError("Access denied. Vendor account required.");
        return;
      }

      console.log("Setting vendor and loading menu items...");
      setVendor(currentUser);
      // Load menu items after vendor is set
      loadMenuItems(currentUser._id);
    } catch (error) {
      console.error("Auth check error:", error);
      setError("Authentication failed. Please sign in again.");
      setTimeout(() => {
        navigate('/vendor-login');
      }, 2000);
    }
  };

  const loadMenuItems = async (vendorId) => {
    try {
      console.log("Loading menu items for vendor:", vendorId);
      setIsLoading(true);
      setError("");
      
      // Get menu items for the current vendor
      const response = await menuService.getAll(vendorId);
      console.log("Menu service response:", response);
      
      if (response.success) {
        setMenuItems(response.data || []);
        console.log("Menu items set:", response.data);
      } else {
        setError("Failed to load menu items");
      }
    } catch (error) {
      console.error("Error loading menu items:", error);
      setError(error.message || "Failed to load menu items");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveItem = async (itemData) => {
    try {
      setIsSaving(true);
      setError("");

      if (editingItem) {
        // Update existing item
        const response = await menuService.update(editingItem._id, itemData);
        
        if (response.success) {
          setMenuItems(menuItems.map(item => 
            item._id === editingItem._id ? response.data : item
          ));
          setShowForm(false);
          setEditingItem(null);
        } else {
          setError("Failed to update menu item");
        }
      } else {
        // Create new item
        const response = await menuService.create(itemData);
        
        if (response.success) {
          setMenuItems([...menuItems, response.data]);
          setShowForm(false);
        } else {
          setError("Failed to create menu item");
        }
      }
    } catch (error) {
      console.error("Error saving menu item:", error);
      setError(error.message || "Failed to save menu item");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleToggleAvailability = async (itemToToggle) => {
    try {
      const newAvailability = !itemToToggle.available;
      
      const response = await menuService.updateAvailability(itemToToggle._id, newAvailability);
      
      if (response.success) {
        setMenuItems(menuItems.map(item => 
          item._id === itemToToggle._id ? { ...item, available: newAvailability } : item
        ));
      } else {
        setError("Failed to update availability");
      }
    } catch (error) {
      console.error("Error toggling availability:", error);
      setError(error.message || "Failed to update availability");
    }
  };

  const handleDeleteItem = async (itemToDelete) => {
    if (!window.confirm(`Are you sure you want to delete "${itemToDelete.name}"?`)) {
      return;
    }

    try {
      const response = await menuService.delete(itemToDelete._id);
      
      if (response.success) {
        setMenuItems(menuItems.filter(item => item._id !== itemToDelete._id));
      } else {
        setError("Failed to delete menu item");
      }
    } catch (error) {
      console.error("Error deleting menu item:", error);
      setError(error.message || "Failed to delete menu item");
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", "appetizers", "mains", "desserts", "beverages", "wine", "cocktails", "coffee"];

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading menu items...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !vendor) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/vendor-login')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setError("")}
            className="ml-auto"
          >
            Dismiss
          </Button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Menu Management
          </h1>
          <p className="text-slate-600">
            Manage your restaurant's menu items, pricing, and availability
          </p>
          {vendor && (
            <p className="text-sm text-slate-500 mt-1">
              Restaurant: {vendor.name || vendor.restaurantName}
            </p>
          )}
        </div>
        <Button 
          onClick={() => {
            setEditingItem(null);
            setShowForm(true);
          }}
          className="gap-2"
          disabled={isSaving}
        >
          <Plus className="w-4 h-4" />
          Add Menu Item
        </Button>
      </div>

      {showForm && (
        <MenuItemForm
          item={editingItem}
          onSave={handleSaveItem}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          isSaving={isSaving}
        />
      )}

      <MenuStats menuItems={menuItems} />

      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search menu items by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>
          
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <div className="overflow-x-auto scrollbar-hide">
              <TabsList className="bg-slate-100 p-1">
                {categories.map(category => (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    className="data-[state=active]:bg-white data-[state=active]:text-blue-900 data-[state=active]:shadow-sm rounded-md text-slate-600 hover:text-slate-900"
                  >
                    {category === "all" ? "All" : category.charAt(0).toUpperCase() + category.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>
        </CardContent>
      </Card>
      
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 text-lg">
            {searchTerm || selectedCategory !== "all" 
              ? "No menu items match your search criteria"
              : "No menu items yet. Add your first item to get started!"
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <MenuItemCard
              key={item._id}
              item={item}
              onEdit={() => handleEditItem(item)}
              onToggleAvailability={() => handleToggleAvailability(item)}
              onDelete={() => handleDeleteItem(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}