import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";

export default function QRCodeDisplay({ table, onDownload }) {
  // Handle vendorId - it could be a string ID or a populated object
  const vendorId = typeof table.vendorId === 'object' ? table.vendorId._id : table.vendorId;
  const vendorName = typeof table.vendorId === 'object' ? table.vendorId.name : 'Unknown Vendor';
  
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(table.qr_code_url)}`;

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-center">
          Table {table.table_number}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-inner">
          <img 
            src={qrUrl} 
            alt={`QR Code for Table ${table.table_number}`}
            className="mx-auto"
          />
        </div>
        
        <div className="text-sm text-slate-600">
          {table.location && <p>Location: {table.location}</p>}
          <p className="text-xs text-slate-500">Vendor: {vendorName}</p>
          <p className="text-xs text-slate-500">Vendor ID: {vendorId}</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => window.open(table.qr_code_url, '_blank')}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button 
            size="sm" 
            className="flex-1 bg-blue-900 hover:bg-blue-800"
            onClick={() => onDownload(table)}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}