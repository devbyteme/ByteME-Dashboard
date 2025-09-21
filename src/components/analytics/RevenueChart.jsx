import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from "lucide-react";

export default function RevenueChart({ dailyRevenue }) {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Daily Revenue (Last 7 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {dailyRevenue && dailyRevenue.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`LKR ${value.toFixed(2)}`, 'Revenue']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar dataKey="revenue" fill="#1e40af" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No revenue data available</p>
              <p className="text-slate-400 text-sm">Chart will appear when you receive orders</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}