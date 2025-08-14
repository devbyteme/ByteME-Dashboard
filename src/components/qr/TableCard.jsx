
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, MapPin, Trash2 } from "lucide-react";
import { createPageUrl } from "@/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function TableCard({ table, onDelete }) {
  // Handle vendorId - it could be a string ID or a populated object
  const vendorId = typeof table.vendorId === 'object' ? table.vendorId._id : table.vendorId;
  const vendorName = typeof table.vendorId === 'object' ? table.vendorId.name : 'Unknown Vendor';
  
  const menuUrl = `${window.location.origin}${createPageUrl("CustomerMenu")}?restaurant=${vendorId}&table=${table.table_number}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(menuUrl)}`;

  const downloadQR = () => {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `table-${table.table_number}-qr.png`;
    link.click();
  };

  const previewMenu = () => {
    window.open(menuUrl, '_blank');
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Table {table.table_number}</span>
          <Badge variant="secondary" className="text-xs">
            {table.location || 'Main dining'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-inner">
          <img 
            src={qrUrl} 
            alt={`QR Code for Table ${table.table_number}`}
            className="mx-auto"
          />
        </div>
        
        <div className="text-sm text-slate-600 space-y-1">
          {table.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{table.location}</span>
            </div>
          )}
          <div className="text-xs text-slate-500">
            <p>Vendor: {vendorName}</p>
            <p>Vendor ID: {vendorId}</p>
            <p className="truncate">QR URL: {menuUrl}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={previewMenu}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button 
            size="sm" 
            className="flex-1 bg-blue-900 hover:bg-blue-800"
            onClick={downloadQR}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
        
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Table
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Table</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete Table {table.table_number}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(table.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
