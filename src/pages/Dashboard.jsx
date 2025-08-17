import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  TrendingUp, 
  ShoppingCart,
  ChefHat,
  DollarSign,
  Clock
} from "lucide-react";

import StatsCard from "../components/dashboard/StatsCard";
import RecentOrders from "../components/dashboard/RecentOrders";
import QuickActions from "../components/dashboard/QuickActions";

// --- Sample Data ---
const sampleOrders = [
  { id: '1', created_date: new Date().toISOString(), total_amount: 35.50, status: 'preparing', table_number: '5', items: [{ quantity: 1, name: 'Truffle Pasta' }, { quantity: 1, name: 'Red Wine' }] },
  { id: '2', created_date: new Date().toISOString(), total_amount: 52.00, status: 'pending', table_number: '12', items: [{ quantity: 2, name: 'Ribeye Steak' }, { quantity: 2, name: 'Coke' }] },
  { id: '3', created_date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), total_amount: 21.75, status: 'served', table_number: '3', items: [{ quantity: 1, name: 'Caesar Salad' }] },
  { id: '4', created_date: new Date().toISOString(), total_amount: 88.00, status: 'preparing', table_number: '8', items: [{ quantity: 4, name: 'Sushi Platter' }] },
];
const sampleMenuItems = [
  { id: '1', name: 'Ribeye Steak', price: 26.00, available: true, category: 'mains' },
  { id: '2', name: 'Caesar Salad', price: 12.00, available: true, category: 'appetizers' },
  { id: '3', name: 'Tiramisu', price: 8.00, available: false, category: 'desserts' },
];
const sampleTables = [
  { id: '1', table_number: 'T1', capacity: 2 },
  { id: '2', table_number: 'T2', capacity: 4 },
  { id: '3', table_number: 'P1', capacity: 6 },
];
// --- End Sample Data ---

export default function Dashboard() {
  // Using static data as the backend is disconnected
  const orders = sampleOrders;
  const menuItems = sampleMenuItems;
  const tables = sampleTables;
  const isLoading = false; // Never loading

  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.created_date);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  });

  const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const averageOrderValue = todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0;
  const pendingOrders = orders.filter(order => order.status === 'pending' || order.status === 'preparing').length;

  return (
    <div className="p-6 space-y-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Restaurant Dashboard
            </h1>
            <p className="text-slate-600">
              Welcome back! Here's what's happening at your venue today.
            </p>
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
            title="Today's Revenue"
            value={`$${todayRevenue.toFixed(2)}`}
            icon={DollarSign}
            bgColor="from-emerald-500 to-teal-600"
            change="+12.5%"
          />
          <StatsCard
            title="Orders Today"
            value={todayOrders.length}
            icon={ShoppingCart}
            bgColor="from-blue-500 to-indigo-600"
            change="+8.2%"
          />
          <StatsCard
            title="Average Order"
            value={`$${averageOrderValue.toFixed(2)}`}
            icon={TrendingUp}
            bgColor="from-sky-500 to-cyan-500"
            change="+5.1%"
          />
          <StatsCard
            title="Pending Orders"
            value={pendingOrders}
            icon={Clock}
            bgColor="from-amber-500 to-orange-500"
            urgent={pendingOrders > 5}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RecentOrders orders={orders.slice(0, 10)} isLoading={isLoading} />
          </div>
          
          <div className="space-y-6">
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}