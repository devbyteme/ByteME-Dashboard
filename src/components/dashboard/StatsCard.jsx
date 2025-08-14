import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function StatsCard({ title, value, icon: Icon, bgColor, change, urgent }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {change && (
              <Badge 
                variant="secondary" 
                className={`mt-2 ${urgent ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}
              >
                {change}
              </Badge>
            )}
          </div>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${bgColor} flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}