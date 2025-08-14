import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { QrCode, MenuIcon, Plus, BarChart3 } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Add Menu Item",
      icon: Plus,
      href: createPageUrl("MenuManagement"),
      color: "from-emerald-500 to-teal-600"
    },
    {
      title: "Generate QR",
      icon: QrCode,
      href: createPageUrl("QRGenerator"),
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "View Analytics",
      icon: BarChart3,
      href: createPageUrl("Analytics"),
      color: "from-purple-500 to-pink-600"
    }
  ];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action, index) => (
            <Link key={index} to={action.href}>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12 border-slate-200 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                  <action.icon className="w-4 h-4 text-white" />
                </div>
                {action.title}
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}