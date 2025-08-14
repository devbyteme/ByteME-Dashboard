import React from "react";
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, DollarSign, ShoppingCart, Clock } from "lucide-react";

import RevenueChart from "../components/analytics/RevenueChart";
import PopularItems from "../components/analytics/PopularItems";
import OrderTrends from "../components/analytics/OrderTrends";

// --- Sample Data ---
const sampleOrders = [
  { id: '1', created_date: new Date().toISOString(), total_amount: 35.50, status: 'served', items: [{ name: 'Truffle Pasta', quantity: 1 }, { name: 'Red Wine', quantity: 1 }] },
  { id: '2', created_date: new Date().toISOString(), total_amount: 52.00, status: 'served', items: [{ name: 'Ribeye Steak', quantity: 2 }] },
  { id: '3', created_date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), total_amount: 21.75, status: 'served', items: [{ name: 'Caesar Salad', quantity: 1 }, { name: 'Iced Tea', quantity: 1 }] },
  { id: '4', created_date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), total_amount: 88.00, status: 'served', items: [{ name: 'Sushi Platter', quantity: 1 }] },
  { id: '5', created_date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), total_amount: 45.00, status: 'served', items: [{ name: 'Ribeye Steak', quantity: 1 }, { name: 'Truffle Pasta', quantity: 1 }] },
  { id: '6', created_date: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(), total_amount: 12.00, status: 'served', items: [{ name: 'Caesar Salad', quantity: 1 }] },
  { id: '7', created_date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), total_amount: 24.00, status: 'served', items: [{ name: 'Caesar Salad', quantity: 2 }] },
  { id: '8', created_date: new Date(new Date().setDate(new Date().getDate() - 6)).toISOString(), total_amount: 30.00, status: 'served', items: [{ name: 'Truffle Pasta', quantity: 1 }, { name: 'Iced Tea', quantity: 1 }] },
];
// --- End Sample Data ---

export default function Analytics() {
  const orders = sampleOrders;

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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-slate-600">
            Insights and performance metrics for your restaurant
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Today's Revenue</p>
                <p className="text-2xl font-bold">${todayRevenue.toFixed(2)}</p>
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
    </div>
  );
}