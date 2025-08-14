import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import OrderCard from "../components/orders/OrderCard";
import OrderStats from "../components/orders/OrderStats";

// --- Sample Data ---
const sampleOrders = [
    { id: '1', created_date: new Date(Date.now() - 5 * 60000).toISOString(), table_number: '5', customer_first_name: 'John', customer_last_name: 'Doe', total_amount: 35.50, status: 'pending', items: [{ quantity: 1, name: 'Truffle Pasta', price: 22.50 }, { quantity: 1, name: 'Red Wine', price: 13.00 }] },
    { id: '2', created_date: new Date(Date.now() - 10 * 60000).toISOString(), table_number: '12', customer_first_name: 'Jane', customer_last_name: 'Smith', total_amount: 52.00, status: 'confirmed', items: [{ quantity: 2, name: 'Ribeye Steak', price: 26.00 }] },
    { id: '3', created_date: new Date(Date.now() - 20 * 60000).toISOString(), table_number: '3', customer_first_name: 'Alice', customer_last_name: 'Johnson', total_amount: 21.75, status: 'preparing', items: [{ quantity: 1, name: 'Caesar Salad', price: 12.00 }, { quantity: 1, name: 'Iced Tea', price: 4.75 }] },
    { id: '4', created_date: new Date(Date.now() - 30 * 60000).toISOString(), table_number: '8', customer_first_name: 'Bob', customer_last_name: 'Williams', total_amount: 88.00, status: 'ready', items: [{ quantity: 1, name: 'Sushi Platter', price: 88.00 }] },
    { id: '5', created_date: new Date(Date.now() - 60 * 60000).toISOString(), table_number: '2', customer_first_name: 'Charlie', customer_last_name: 'Brown', total_amount: 15.00, status: 'served', items: [{ quantity: 1, name: 'Espresso', price: 4.00 }, { quantity: 1, name: 'Cheesecake', price: 11.00 }] },
    { id: '6', created_date: new Date(Date.now() - 2 * 60 * 60000).toISOString(), table_number: '7', customer_first_name: 'Diana', customer_last_name: 'Prince', total_amount: 45.00, status: 'cancelled', items: [{ quantity: 2, name: 'Margarita Pizza', price: 22.50 }] },
];
// --- End Sample Data ---

export default function Orders() {
  const [orders, setOrders] = useState(sampleOrders);
  const [isLoading, setIsLoading] = useState(false);

  const loadOrders = async () => {
    // This is a placeholder for your API call.
    console.log("Refreshing orders (placeholder)...");
    setIsLoading(true);
    // await yourApi.getOrders();
    // setOrders(fetchedOrders);
    setTimeout(() => setIsLoading(false), 500); // Simulate network delay
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    // This function is now a placeholder.
    // Your API call to UPDATE an order status would go here.
    console.log(`Updating order ${orderId} to ${newStatus} (placeholder)`);
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const statuses = ["all", "pending", "confirmed", "preparing", "ready", "served", "cancelled"];

  const statusCounts = statuses.reduce((acc, status) => {
    if (status === "all") {
      acc[status] = orders.length;
    } else {
      acc[status] = orders.filter(o => o.status === status).length;
    }
    return acc;
  }, {});
  
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Order Management
          </h1>
          <p className="text-slate-600">
            Track and manage all customer orders in real-time
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={loadOrders}
            className="gap-2"
            disabled={isLoading}
          >
            <Clock className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

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
                <p>No orders with status "{status}"</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}