import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import OrderCard from "../components/orders/OrderCard";
import OrderStats from "../components/orders/OrderStats";
import { Order, authService } from "@/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [vendor, setVendor] = useState(null);

  // Check vendor authentication and load initial data
  useEffect(() => {
    checkVendorAuth();
  }, []);

  // Load orders when vendor changes
  useEffect(() => {
    if (vendor) {
      loadOrders();
    }
  }, [vendor]);

  const checkVendorAuth = async () => {
    try {
      const isAuth = authService.isAuthenticated();
      if (!isAuth) {
        setError("Please login as a vendor to view orders");
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
      // loadOrders will be called by the useEffect when vendor is set
    } catch (error) {
      console.error("Error checking vendor auth:", error);
      setError("Failed to authenticate vendor");
      setIsLoading(false);
    }
  };

  const loadOrders = async () => {
    if (!vendor) return;

    console.log("Loading orders for vendor:", vendor.name);
    setIsLoading(true);
    setError("");

    try {
      // Get all orders for this vendor
      const response = await Order.list();
      
      if (response.success) {
        // Transform the data to match the expected format
        const transformedOrders = response.data.map(order => ({
          id: order._id,
          created_date: order.createdAt,
          table_number: order.tableNumber.toString(),
          customer_first_name: order.customerId?.firstName || 'Guest',
          customer_last_name: order.customerId?.lastName || 'Customer',
          total_amount: order.totalAmount,
          status: order.status,
          items: order.items || [],
          notes: order.notes,
          // New fields
          paymentMethod: order.paymentMethod,
          tipAmount: order.tipAmount || 0,
          tipPercentage: order.tipPercentage || 0,
          dietaryRequirements: order.dietaryRequirements || [],
          specialRequests: order.specialRequests,
          customerPhone: order.customerPhone,
          // Existing fields
          estimatedPreparationTime: order.estimatedPreparationTime,
          actualPreparationTime: order.actualPreparationTime,
          paymentStatus: order.paymentStatus
        }));

        setOrders(transformedOrders);
        console.log(`Loaded ${transformedOrders.length} orders for ${vendor.name}`);
      } else {
        setError(response.message || "Failed to load orders");
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      setError("Failed to load orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      console.log(`Updating order ${orderId} to ${newStatus}`);
      
      // Call backend API to update order status
      const response = await Order.updateStatus(orderId, newStatus);
      
      if (response.success) {
        // Update local state immediately for better UX
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
        
        console.log(`Successfully updated order ${orderId} to ${newStatus}`);
      } else {
        console.error("Failed to update order status:", response.message);
        setError(`Failed to update order status: ${response.message}`);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      setError("Failed to update order status. Please try again.");
    }
  };

  const statuses = ["all", "pending", "preparing", "ready", "served", "cancelled"];

  const statusCounts = statuses.reduce((acc, status) => {
    if (status === "all") {
      acc[status] = orders.length;
    } else {
      acc[status] = orders.filter(o => o.status === status).length;
    }
    return acc;
  }, {});
  
  // Show loading state for initial load
  if (isLoading && !vendor) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !vendor) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Denied</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={checkVendorAuth} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Order Management
          </h1>
          <p className="text-slate-600">
            Track and manage all customer orders for{" "}
            <span className="font-semibold text-blue-600">{vendor?.name}</span>
          </p>
          {orders.length > 0 && (
            <p className="text-sm text-slate-500 mt-1">
              {orders.length} total orders
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={loadOrders}
            className="gap-2"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setError("")}
              className="ml-auto text-red-700 hover:text-red-800"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      <OrderStats orders={orders} />

      <Tabs defaultValue="all" className="w-full">
        <div className="overflow-x-auto scrollbar-hide border-b border-slate-200">
          <TabsList className="bg-transparent p-0">
            {statuses.map(status => (
              <TabsTrigger 
                key={status}
                value={status}
                className="data-[state=active]:bg-white data-[state=active]:text-blue-900 data-[state=active]:shadow-sm rounded-t-md text-slate-600 px-4 py-2"
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {statuses.map(status => (
          <TabsContent key={status} value={status} className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {(status === "all" ? orders : orders.filter(o => o.status === status))
                .map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))}
            </div>
            {statusCounts[status] === 0 && (
              <div className="text-center py-12 text-slate-500">
                {status === "all" ? (
                  <div>
                    <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-lg font-medium text-slate-600 mb-2">No orders yet</p>
                    <p className="text-slate-500">
                      Orders from customers will appear here once they start placing orders.
                    </p>
                  </div>
                ) : (
                  <p>No orders with status "{status}"</p>
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}