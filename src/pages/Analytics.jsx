import React, { useState, useEffect } from "react";
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, DollarSign, ShoppingCart, Clock, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

import RevenueChart from "../components/analytics/RevenueChart";
import PopularItems from "../components/analytics/PopularItems";
import OrderTrends from "../components/analytics/OrderTrends";
import { Order, authService } from "@/api";

export default function Analytics() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [vendor, setVendor] = useState(null);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Check if vendor is authenticated
      const isAuth = authService.isAuthenticated();
      if (!isAuth) {
        setError("Please login as a vendor to view analytics");
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
      await loadOrders();

    } catch (error) {
      console.error("Error loading analytics data:", error);
      setError("Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await Order.list();
      if (response.success) {
        // Transform the data to match the expected format for analytics
        const transformedOrders = response.data.map(order => ({
          id: order._id,
          created_date: order.createdAt,
          total_amount: order.totalAmount,
          status: order.status,
          items: order.items || [],
          tableNumber: order.tableNumber,
          customerId: order.customerId,
          notes: order.notes
        }));
        setOrders(transformedOrders);
        console.log(`Loaded ${transformedOrders.length} orders for analytics`);
      } else {
        console.error("Failed to load orders:", response.message);
        setError("Failed to load order data for analytics");
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      setError("Failed to load order data");
    }
  };

  const calculateRevenue = (period) => {
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(0);
    }
    
    return orders
      .filter(order => new Date(order.created_date) >= startDate)
      .reduce((sum, order) => sum + (order.total_amount || 0), 0);
  };

  const getPopularItems = () => {
    const itemCounts = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
      });
    });
    
    return Object.entries(itemCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
  };

  const getDailyRevenue = () => {
    const dailyData = {};
    orders.forEach(order => {
      const date = new Date(order.created_date).toISOString().split('T')[0];
      dailyData[date] = (dailyData[date] || 0) + (order.total_amount || 0);
    });
    
    return Object.entries(dailyData)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .slice(-7)
      .map(([date, revenue]) => ({ date, revenue }));
  };

  const todayRevenue = calculateRevenue('today');
  const weekRevenue = calculateRevenue('week');
  const monthRevenue = calculateRevenue('month');
  const averageOrderValue = orders.length > 0 ? orders.reduce((sum, order) => sum + order.total_amount, 0) / orders.length : 0;

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Loading Analytics</h3>
            <p className="text-slate-600">Analyzing your restaurant performance...</p>
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
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-slate-600">
            Insights and performance metrics for your restaurant
          </p>
          {vendor && (
            <p className="text-sm text-slate-500 mt-1">
              Restaurant: {vendor.name || vendor.restaurantName}
            </p>
          )}
        </div>
        <div className="text-sm text-slate-500">
          Based on {orders.length} {orders.length === 1 ? 'order' : 'orders'}
        </div>
      </div>

      {/* Key Metrics */}
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-slate-600 mb-2">No Order Data</h3>
          <p className="text-slate-500 mb-6">
            Start receiving orders to see your analytics and business insights.
          </p>
          <Link to="/menu-management">
            <Button>Manage Menu Items</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm">Today's Revenue</p>
                    <p className="text-2xl font-bold">${todayRevenue.toFixed(2)}</p>
                    <p className="text-emerald-200 text-xs mt-1">
                      {orders.filter(order => {
                        const orderDate = new Date(order.created_date);
                        const today = new Date();
                        return orderDate.toDateString() === today.toDateString();
                      }).length} orders today
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-emerald-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Weekly Revenue</p>
                    <p className="text-2xl font-bold">${weekRevenue.toFixed(2)}</p>
                    <p className="text-blue-200 text-xs mt-1">
                      Last 7 days
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm">Monthly Revenue</p>
                    <p className="text-2xl font-bold">${monthRevenue.toFixed(2)}</p>
                    <p className="text-amber-200 text-xs mt-1">
                      Current month
                    </p>
                  </div>
                  <ShoppingCart className="w-8 h-8 text-amber-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Avg Order Value</p>
                    <p className="text-2xl font-bold">${averageOrderValue.toFixed(2)}</p>
                    <p className="text-purple-200 text-xs mt-1">
                      All time average
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-8">
            <RevenueChart dailyRevenue={getDailyRevenue()} />
            <PopularItems popularItems={getPopularItems()} />
          </div>

          <OrderTrends orders={orders} />
        </>
      )}
    </div>
  );
}