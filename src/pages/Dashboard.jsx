import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  TrendingUp, 
  ShoppingCart,
  ChefHat,
  DollarSign,
  Clock,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

import StatsCard from "../components/dashboard/StatsCard";
import RecentOrders from "../components/dashboard/RecentOrders";
import QuickActions from "../components/dashboard/QuickActions";
import { Order, MenuItem, Table, authService } from "@/api";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [vendor, setVendor] = useState(null);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  // Reload data when vendor changes (fallback)
  useEffect(() => {
    if (vendor && vendor._id) {
      loadMenuItems(vendor._id);
      loadTables(vendor._id);
    }
  }, [vendor]);

  const checkAuthAndLoadData = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Check if vendor is authenticated
      const isAuth = authService.isAuthenticated();
      if (!isAuth) {
        setError("Please login as a vendor to view dashboard");
        setIsLoading(false);
        return;
      }

      const currentVendor = await authService.getCurrentUser();
      if (!currentVendor || currentVendor.userType !== 'vendor') {
        setError("Access denied. Vendor account required.");
        setIsLoading(false);
        return;
      }

      setVendor(currentVendor);
      console.log('Vendor set:', currentVendor);

      // Load all dashboard data in parallel
      await Promise.all([
        loadOrders(),
        loadMenuItems(currentVendor._id),
        loadTables(currentVendor._id)
      ]);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await Order.list();
      if (response.success) {
        // Transform the data to match the expected format
        const transformedOrders = response.data.map(order => ({
          id: order._id,
          created_date: order.createdAt,
          table_number: order.tableNumber?.toString() || 'N/A',
          customer_first_name: order.customerId?.firstName || 'Guest',
          customer_last_name: order.customerId?.lastName || 'Customer',
          total_amount: order.totalAmount,
          status: order.status,
          items: order.items || [],
          notes: order.notes,
          estimatedPreparationTime: order.estimatedPreparationTime,
          actualPreparationTime: order.actualPreparationTime,
          paymentStatus: order.paymentStatus
        }));
        setOrders(transformedOrders);
        console.log(`Loaded ${transformedOrders.length} orders`);
      } else {
        console.error("Failed to load orders:", response.message);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  const loadMenuItems = async (vendorId) => {
    try {
      // Only load menu items if we have a vendor ID
      if (!vendorId) {
        console.log("No vendor ID provided for loading menu items");
        return;
      }
      
      const response = await MenuItem.list(vendorId);
      if (response.success) {
        setMenuItems(response.data);
        console.log(`Loaded ${response.data.length} menu items for vendor ${vendorId}`);
      } else {
        console.error("Failed to load menu items:", response.message);
      }
    } catch (error) {
      console.error("Error loading menu items:", error);
    }
  };

  const loadTables = async (vendorId) => {
    try {
      // Only load tables if we have a vendor ID
      if (!vendorId) {
        console.log("No vendor ID provided for loading tables");
        return;
      }
      
      const response = await Table.list(vendorId);
      if (response.success) {
        setTables(response.data);
        console.log(`Loaded ${response.data.length} tables for vendor ${vendorId}`);
      } else {
        console.error("Failed to load tables:", response.message);
      }
    } catch (error) {
      console.error("Error loading tables:", error);
    }
  };

  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.created_date);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  });

  const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const averageOrderValue = todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0;
  const pendingOrders = orders.filter(order => order.status === 'pending' || order.status === 'preparing').length;

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Loading Dashboard</h3>
            <p className="text-slate-600">Fetching your restaurant data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !vendor) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Access Required</h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <Link to="/vendor-login">
              <Button>Go to Login</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Restaurant Dashboard
            </h1>
            <p className="text-slate-600">
              Welcome back! Here's what's happening at your venue today.
            </p>
            {vendor && (
              <p className="text-sm text-slate-500 mt-1">
                Restaurant: {vendor.name || vendor.restaurantName}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl("MenuManagement")}>
              <Button variant="outline" className="gap-2 bg-white text-slate-700 border-slate-300 hover:bg-slate-50">
                <ChefHat className="w-4 h-4" />
                Manage Menu
              </Button>
            </Link>
            <Link to={createPageUrl("QRGenerator")}>
              <Button className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Generate QR
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Today's Revenue(LKR)"
            value={`${todayRevenue.toFixed(2)}`}
            icon={DollarSign}
            bgColor="from-emerald-500 to-teal-600"
            subtitle={`${todayOrders.length} orders today`}
          />
          <StatsCard
            title="Total Orders"
            value={orders.length}
            icon={ShoppingCart}
            bgColor="from-blue-500 to-indigo-600"
            subtitle={`${todayOrders.length} today`}
          />
          <StatsCard
            title="Menu Items"
            value={menuItems.length}
            icon={ChefHat}
            bgColor="from-sky-500 to-cyan-500"
            subtitle={`${menuItems.filter(item => item.available).length} available`}
          />
          <StatsCard
            title="Pending Orders"
            value={pendingOrders}
            icon={Clock}
            bgColor="from-amber-500 to-orange-500"
            urgent={pendingOrders > 5}
            subtitle={pendingOrders > 0 ? "Need attention" : "All caught up!"}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RecentOrders orders={orders.slice(0, 10)} isLoading={false} />
          </div>
          
          <div className="space-y-6">
            <QuickActions />
            
            {/* Additional Dashboard Stats */}
            {tables.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Restaurant Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Tables:</span>
                    <span className="font-medium">{tables.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Capacity:</span>
                    <span className="font-medium">{tables.reduce((sum, table) => sum + (table.capacity || 0), 0)} seats</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Available Items:</span>
                    <span className="font-medium">{menuItems.filter(item => item.available).length}/{menuItems.length}</span>
                  </div>
                  {todayOrders.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Avg Order Value:</span>
                      <span className="font-medium">LKR {averageOrderValue.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}