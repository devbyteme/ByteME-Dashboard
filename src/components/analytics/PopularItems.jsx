import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Award } from "lucide-react";

export default function PopularItems({ popularItems }) {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Most Popular Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        {popularItems && popularItems.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={popularItems} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip 
                formatter={(value) => [value, 'Orders']}
                labelFormatter={(label) => `Item: ${label}`}
              />
              <Bar dataKey="count" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No popular items data</p>
              <p className="text-slate-400 text-sm">Chart will show when you receive orders</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}