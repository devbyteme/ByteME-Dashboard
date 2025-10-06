import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Crown, QrCode, Camera, AlertCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function QRScanner() {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");
  const [scannedData, setScannedData] = useState("");

  const handleScan = () => {
    setIsScanning(true);
    setError("");
    
    // For demo purposes, we'll simulate a QR scan
    // In a real implementation, you would use a QR code scanning library
    setTimeout(() => {
      // Simulate scanning a QR code with restaurant and table data
      const mockQRData = {
        restaurant: "demo-restaurant-123",
        table: "5"
      };
      
      setScannedData(JSON.stringify(mockQRData));
      setIsScanning(false);
      
      // Navigate to the login selection page first
      navigate(`/customer-login-selection?restaurant=${mockQRData.restaurant}&table=${mockQRData.table}`);
    }, 2000);
  };

  const handleManualEntry = () => {
    // For demo purposes, navigate to a sample restaurant's login selection
    navigate('/customer-login-selection?restaurant=demo-restaurant-123&table=1');
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-3 text-slate-900">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-800 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold">ByteMe</h1>
          </div>
        </div>
        
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-900">Scan QR Code</CardTitle>
            <CardDescription className="text-slate-600">
              Point your camera at the QR code on your table to access the menu
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="text-center space-y-6">
              {/* QR Scanner Display */}
              <div className="relative">
                <div className="w-64 h-64 mx-auto bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  {isScanning ? (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-800 mx-auto mb-4"></div>
                      <p className="text-gray-600">Scanning...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">QR Code Scanner</p>
                    </div>
                  )}
                </div>
                
                {/* Scanning Frame */}
                {isScanning && (
                  <div className="absolute inset-0 border-2 border-blue-500 rounded-lg animate-pulse"></div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={handleScan}
                  className="w-full h-12 gap-2"
                  disabled={isScanning}
                >
                  <Camera className="w-5 h-5" />
                  {isScanning ? 'Scanning...' : 'Start Scanning'}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleManualEntry}
                  className="w-full h-12 gap-2"
                >
                  <ArrowRight className="w-5 h-5" />
                  Demo: View Sample Menu
                </Button>
              </div>

              {/* Instructions */}
              <div className="text-left space-y-2 text-sm text-gray-600">
                <h4 className="font-medium text-gray-800">How to use:</h4>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Look for the QR code on your table</li>
                  <li>Point your camera at the QR code</li>
                  <li>Tap the scan button to start</li>
                  <li>Browse the menu and place your order</li>
                </ol>
              </div>

              {/* Demo Note */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700 text-sm">
                  <strong>Demo Mode:</strong> This is a demonstration. In a real restaurant, 
                  you would scan the actual QR code on your table.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 