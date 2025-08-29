import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User as UserIcon, 
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  Trophy,
  Gift
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

// --- Sample Data ---
const sampleUser = {
  full_name: "John Customer",
  email: "john.customer@example.com"
};

const sampleProfile = {
  loyalty_points: 1250,
};

const sampleOrders = [
  { id: '1', created_date: new Date().toISOString(), table_number: '5', status: 'served', venue_name: 'The Grand Brasserie', final_amount: 35.50, tip_amount: 5.00, items: [{ quantity: 1, name: 'Truffle Pasta' }] },
  { id: '2', created_date: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(), table_number: 'A2', status: 'served', venue_name: 'Seaside Grill', final_amount: 88.00, tip_amount: 12.00, items: [{ quantity: 1, name: 'Lobster' }, { quantity: 2, name: 'White Wine' }] },
  { id: '3', created_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(), table_number: '10', status: 'cancelled', venue_name: 'The Grand Brasserie', final_amount: 25.00, tip_amount: 0, items: [{ quantity: 1, name: 'Pizza' }] },
];

const samplePerks = [
  { id: '1', title: '15% Off Your Next Main Course', description: 'Enjoy a discount on any main course.', type: 'discount', value: 15, valid_until: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(), minimum_spend: 20 },
  { id: '2', title: 'Free Dessert', description: 'Get a free dessert with any order over $50.', type: 'free_item', value: 1, valid_until: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(), minimum_spend: 50 },
];
// --- End Sample Data ---

export default function CustomerProfile() {
  const [user] = useState(sampleUser);
  const [profile] = useState(sampleProfile);
  const [orders] = useState(sampleOrders);
  const [perks] = useState(samplePerks);
  const [isLoading] = useState(false);

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      preparing: "bg-purple-100 text-purple-800",
      ready: "bg-green-100 text-green-800",
      served: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-secondary to-brand-white flex items-center justify-center">
        <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-primary mx-auto mb-4"></div>
        <p className="text-brand-dark/70">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-secondary to-brand-white">
      <div className="bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("CustomerOrder")}>
              <Button variant="ghost" size="sm" className="gap-2 text-brand-dark hover:text-brand-primary">
                <ArrowLeft className="w-4 h-4" />
                Back to Menu
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <img src="/src/assets/Main Logo_ByteMe.png" alt="ByteMe Logo" className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold text-brand-dark">My Profile</h1>
                <p className="text-sm text-brand-dark/70">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-brand-dark/70">Total Orders</p>
                  <p className="text-2xl font-bold text-brand-primary">{orders.length}</p>
                </div>
                <ShoppingBag className="w-8 h-8 text-brand-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-brand-dark/70">Total Spent</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${orders.reduce((sum, order) => sum + (order.final_amount || 0), 0).toFixed(2)}
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-brand-dark/70">Loyalty Points</p>
                  <p className="text-2xl font-bold text-amber-600">{profile?.loyalty_points || 0}</p>
                </div>
                <Trophy className="w-8 h-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="w-full">
                      <TabsList className="bg-white/80 backdrop-blur-sm border-0 shadow-lg p-1 rounded-lg">
              <TabsTrigger value="orders" className="data-[state=active]:bg-brand-white data-[state=active]:text-brand-primary data-[state=active]:shadow-sm rounded-md text-brand-dark/70">Order History</TabsTrigger>
              <TabsTrigger value="perks" className="data-[state=active]:bg-brand-white data-[state=active]:text-brand-primary data-[state=active]:shadow-sm rounded-md text-brand-dark/70">Special Offers</TabsTrigger>
            </TabsList>

          <TabsContent value="orders" className="mt-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-brand-dark">Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                            <span className="text-sm text-brand-dark/70">
                              Table {order.table_number}
                            </span>
                          </div>
                          <p className="text-sm text-brand-dark/70">
                            {format(new Date(order.created_date), "PPp")}
                          </p>
                          <p className="text-sm font-medium text-brand-dark">
                            {order.venue_name || "Fine Dining Restaurant"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-brand-dark">
                            ${(order.final_amount || 0).toFixed(2)}
                          </p>
                          {order.tip_amount > 0 && (
                            <p className="text-xs text-brand-dark/50">
                              (inc. ${order.tip_amount.toFixed(2)} tip)
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        {order.items?.slice(0, 3).map((item, index) => (
                          <p key={index} className="text-sm text-brand-dark">
                            {item.quantity}x {item.name}
                          </p>
                        ))}
                        {order.items?.length > 3 && (
                          <p className="text-sm text-brand-dark/50">
                            +{order.items.length - 3} more items
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {orders.length === 0 && (
                    <div className="text-center py-8 text-brand-dark/50">
                      <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No orders yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="perks" className="mt-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-brand-dark">Special Offers & Perks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {perks.map((perk) => (
                    <div key={perk.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Gift className="w-5 h-5 text-amber-600" />
                          <h3 className="font-semibold text-brand-dark">{perk.title}</h3>
                        </div>
                        <Badge className="bg-amber-100 text-amber-800">
                          {perk.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-brand-dark/70 mb-3">
                        {perk.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-brand-dark/50">
                        {perk.valid_until && (
                          <span>Expires: {format(new Date(perk.valid_until), "PP")}</span>
                        )}
                        {perk.minimum_spend && (
                          <span>Min spend: ${perk.minimum_spend}</span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {perks.length === 0 && (
                    <div className="col-span-2 text-center py-8 text-brand-dark/50">
                      <Gift className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No special offers available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}