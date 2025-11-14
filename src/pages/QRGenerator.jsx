import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Download, QrCode, Loader2 } from "lucide-react";
import { User } from "@/api";
import { tableService } from "@/api";
import { useNavigate } from "react-router-dom";

import TableCard from "../components/qr/TableCard";

// Helper function to create menu URLs with vendor ID and table number
// Updated to redirect to login selection page first
const createCustomerMenuUrl = (vendorId, tableNumber) => {
  const origin = window.location.origin;
  const pagePath = "/customer-login-selection";
  return `${origin}${pagePath}?restaurant=${vendorId}&table=${tableNumber}`;
};

export default function QRGenerator() {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newTable, setNewTable] = useState({
    table_number: "",
    location: "",
    capacity: 4
  });
  const [vendor, setVendor] = useState(null);
  const [error, setError] = useState("");
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuthenticated = User.isAuthenticated();
      if (!isAuthenticated) {
        navigate('/vendor-login');
        return;
      }
      
      const currentUser = await User.me();
      if (!currentUser) {
        setError("Access denied. Vendor account required.");
        return;
      }
      
      setVendor(currentUser);
      loadTables(currentUser._id);
    } catch (error) {
      console.error("Authentication error:", error);
      setError("Authentication failed. Please login again.");
      navigate('/vendor-login');
    }
  };

  const loadTables = async (vendorId) => {
    try {
      setIsLoading(true);
      const response = await tableService.getAll(vendorId);
      if (response.success) {
        // Transform backend data to match frontend expectations
        const transformedTables = response.data.map(table => {
          // Extract vendor ID from populated object or use the ID directly
          const tableVendorId = typeof table.vendorId === 'object' ? table.vendorId._id : table.vendorId;
          
          return {
            id: table._id,
            table_number: table.number,
            location: table.location,
            capacity: table.capacity || 4, // Default to 4 if not set
            vendorId: table.vendorId, // Keep the full object for display
            qr_code_url: createCustomerMenuUrl(tableVendorId, table.number),
            status: table.status
          };
        });
        setTables(transformedTables);
      } else {
        console.error("Failed to load tables:", response.message);
        setError("Failed to load tables");
      }
    } catch (error) {
      console.error("Error loading tables:", error);
      setError("Failed to load tables");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTable = async (e) => {
    e.preventDefault();
    if (!vendor) {
      setError("Vendor not authenticated");
      return;
    }
    
    try {
      const tableData = {
        number: newTable.table_number,
        location: newTable.location,
        capacity: parseInt(newTable.capacity),
        vendorId: vendor._id
      };
      
      const response = await tableService.create(tableData);
      
      if (response.success) {
        const createdTable = response.data;
        
        // Extract vendor ID from populated object or use the ID directly
        const vendorId = typeof createdTable.vendorId === 'object' ? createdTable.vendorId._id : createdTable.vendorId;
        
        const tableToAdd = {
          id: createdTable._id,
          table_number: createdTable.number,
          location: createdTable.location,
          capacity: createdTable.capacity,
          vendorId: createdTable.vendorId, // Keep the full object for display
          qr_code_url: createCustomerMenuUrl(vendorId, createdTable.number),
          status: createdTable.status
        };
        
        setTables([...tables, tableToAdd]);
        setShowForm(false);
        setNewTable({ table_number: "", location: "", capacity: 4 });
        setError("");
      } else {
        setError(response.message || "Failed to create table");
      }
    } catch (error) {
      console.error("Error creating table:", error);
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);
      
      if (error.response && error.response.data) {
        setError(`Failed to create table: ${error.response.data.message || error.response.data.error || 'Unknown error'}`);
      } else {
        setError(`Failed to create table: ${error.message}`);
      }
    }
  };

  const handleDeleteTable = async (tableId) => {
    try {
      const response = await tableService.delete(tableId);
      if (response.success) {
        setTables(tables.filter(table => table.id !== tableId));
        setError("");
      } else {
        setError(response.message || "Failed to delete table");
      }
    } catch (error) {
      console.error("Error deleting table:", error);
      setError("Failed to delete table");
    }
  };

  const downloadAllQRCodes = async () => {
    setIsDownloadingAll(true);
    try {
      // Create a print-friendly window
      const printWindow = window.open('', '_blank');
      
      // Generate HTML with QR codes
      const qrCodesHTML = tables.map(table => {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(table.qr_code_url)}`;
        return `
          <div style="page-break-inside: avoid; margin: 20px; text-align: center; border: 1px solid #ccc; padding: 20px;">
            <h3>Table ${table.table_number}</h3>
            <img src="${qrUrl}" alt="QR Code for Table ${table.table_number}" style="width: 200px; height: 200px;"/>
            <p>Location: ${table.location || 'Main dining'}</p>
            <p style="font-size: 10px; margin-top: 10px; word-break: break-all;">${table.qr_code_url}</p>
          </div>
        `;
      }).join('');
      
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Codes - All Tables</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              @media print { 
                @page { size: A4; margin: 1cm; } 
                .no-print { display: none; }
              }
              .download-btn {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #3b82f6;
                color: white;
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                z-index: 1000;
              }
            </style>
          </head>
          <body>
            <button class="download-btn no-print" onclick="downloadAllAsZip()">Download All as ZIP</button>
            <h1 style="text-align: center; margin-bottom: 30px;">Restaurant QR Codes</h1>
            <div style="display: flex; flex-wrap: wrap; justify-content: center;">
              ${qrCodesHTML}
            </div>
            <script>
              async function downloadAllAsZip() {
                try {
                  const tables = ${JSON.stringify(tables)};
                  const zip = new JSZip();
                  
                  for (const table of tables) {
                    const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=' + encodeURIComponent(table.qr_code_url);
                    const response = await fetch(qrUrl);
                    const blob = await response.blob();
                    zip.file('table-' + table.table_number + '-qr.png', blob);
                  }
                  
                  const content = await zip.generateAsync({type: 'blob'});
                  const url = URL.createObjectURL(content);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'restaurant-qr-codes.zip';
                  link.click();
                  URL.revokeObjectURL(url);
                } catch (error) {
                  console.error('Error creating ZIP:', error);
                  alert('Error creating ZIP file. Please try downloading individual QR codes.');
                }
              }
            </script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
          </body>
        </html>
      `);
      printWindow.document.close();
      
      // Auto-print after a short delay to ensure images are loaded
      setTimeout(() => {
        printWindow.print();
      }, 1000);
      
    } catch (error) {
      console.error('Error generating QR codes for printing:', error);
      setError('Failed to generate QR codes for printing');
    } finally {
      setIsDownloadingAll(false);
    }
  };

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            QR Code Generator
          </h1>
          <p className="text-slate-600">
            Generate and manage QR codes for your restaurant tables
          </p>
          {vendor && (
            <p className="text-sm text-slate-500">
              Restaurant: {vendor.restaurantName || vendor.name || 'Your Restaurant'}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          {tables.length > 0 && (
            <Button 
              variant="outline" 
              onClick={downloadAllQRCodes}
              disabled={isDownloadingAll}
              className="gap-2 bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            >
              {isDownloadingAll ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isDownloadingAll ? 'Generating...' : 'Download All QR'}
            </Button>
          )}
          <Button 
            onClick={() => setShowForm(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Table
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {showForm && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <QrCode className="w-5 h-5" />
              Add New Table
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTable} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="table_number" className="text-slate-700">Table Number</Label>
                  <Input
                    id="table_number"
                    type = "number"
                    value={newTable.table_number}
                    onChange={(e) => setNewTable({...newTable, table_number: e.target.value})}
                    placeholder="e.g.,1,2,3,4"
                    className="bg-white text-slate-900"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location" className="text-slate-700">Table Name</Label>
                  <Input
                    id="location"
                    value={newTable.location}
                    onChange={(e) => setNewTable({...newTable, location: e.target.value})}
                    placeholder="e.g., T1, A5, Patio-3 "
                    className="bg-white text-slate-900"
                  />
                </div>
                <div>
                  <Label htmlFor="capacity" className="text-slate-700">Number of Seats</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={newTable.capacity}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow empty string for editing, otherwise parse as integer
                      if (value === '') {
                        setNewTable({...newTable, capacity: ''});
                      } else {
                        const numValue = parseInt(value);
                        if (!isNaN(numValue) && numValue > 0) {
                          setNewTable({...newTable, capacity: numValue});
                        }
                      }
                    }}
                    placeholder="4"
                    className="bg-white text-slate-900"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit">
                  Create Table & Generate QR
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="bg-white text-slate-700 border-slate-300 hover:bg-slate-50">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading tables...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map(table => (
            <TableCard 
              key={table.id} 
              table={table} 
              onDelete={handleDeleteTable}
            />
          ))}
        </div>
      )}
    </div>
  );
}