import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from "lucide-react";

export default function OrderTrends({ orders }) {
  const getHourlyData = () => {
    if (!orders || orders.length === 0) return [];
    
    const hourlyData = {};
    orders.forEach(order => {
      const hour = new Date(order.created_date).getHours();
      hourlyData[hour] = (hourlyData[hour] || 0) + 1;
    });
    
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      orders: hourlyData[i] || 0
    }));
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Order Trends by Hour
        </CardTitle>
      </CardHeader>
      <CardContent>
        {orders && orders.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getHourlyData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [value, 'Orders']}
                labelFormatter={(label) => `Hour: ${label}:00`}
              />
              <Line type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No order trends data</p>
              <p className="text-slate-400 text-sm">Chart will show hourly patterns when you receive orders</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}