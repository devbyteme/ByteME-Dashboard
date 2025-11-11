import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Calculator,
  Upload,
  Image as ImageIcon,
  X as XIcon,
} from "lucide-react";
import { authService } from "@/api";

const VendorProfile = ({ user, onProfileUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("personal");

  // Personal Information Form
  const [personalForm, setPersonalForm] = useState({
    email: "",
    phone: "",
    restaurantName: "",
  });

  // Vendor Information Form
  const [vendorForm, setVendorForm] = useState({
    description: "",
    cuisine: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  // Billing Settings Form
  const [billingForm, setBillingForm] = useState({
    taxRate: 0,
    serviceChargeRate: 0,
  });

  // Logo Upload State
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  // Initialize forms with user data
  useEffect(() => {
    if (user) {
      setPersonalForm({
        email: user.email || "",
        phone: user.phone || "",
        restaurantName: user.name || user.restaurantName || "",
      });

      setVendorForm({
        description: user.description || "",
        cuisine: user.cuisine || "",
        phone: user.phone || "",
        address: user.location?.address || "",
        city: user.location?.city || "",
        state: user.location?.state || "",
        zipCode: user.location?.zipCode || "",
      });

      setBillingForm({
        taxRate: user.billingSettings?.taxRate || 0,
        serviceChargeRate: user.billingSettings?.serviceChargeRate || 0,
      });

      // Initialize logo
      if (user.logo) {
        setLogoPreview(user.logo);
      }
    }
  }, [user]);

  const handlePersonalChange = (field, value) => {
    setPersonalForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleVendorChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setVendorForm((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setVendorForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleBillingChange = (field, value) => {
    setBillingForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Logo Upload Handlers
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (1MB limit)
      if (file.size > 1 * 1024 * 1024) {
        alert("Logo size must be less than 1MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      setLogoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
  };

  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Update both personal info and restaurant name
      const personalData = {
        phone: personalForm.phone,
      };

      const response = await authService.updateProfile(personalData);
      if (response.success) {
        // Also update the restaurant name
        const vendorData = {
          name: personalForm.restaurantName,
        };

        const vendorResponse = await authService.updateVendorProfile(
          vendorData
        );
        if (vendorResponse.success) {
          setSuccess("Personal information updated successfully!");
          if (onProfileUpdate) {
            onProfileUpdate({ ...response.data, ...vendorResponse.data });
          }
        } else {
          throw new Error(
            vendorResponse.message || "Failed to update restaurant name"
          );
        }

        setTimeout(() => {
          setSuccess("");
        }, 3000);
      } else {
        throw new Error(
          response.message || "Failed to update personal information"
        );
      }
    } catch (error) {
      console.error("Error updating personal information:", error);
      setError(error.message || "Failed to update personal information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Create FormData for logo upload
      const formData = new FormData();

      // Add vendor data
      formData.append("description", vendorForm.description);
      formData.append("cuisine", vendorForm.cuisine);
      formData.append("phone", vendorForm.phone);
      formData.append("location[address]", vendorForm.address);
      formData.append("location[city]", vendorForm.city);
      formData.append("location[state]", vendorForm.state);
      formData.append("location[zipCode]", vendorForm.zipCode);

      // Handle logo file upload
      if (logoFile) {
        formData.append("logo", logoFile);
        console.log("Sending logo file:", logoFile.name);
      } else if (!logoPreview && user?.logo) {
        // If logo was removed, send empty string to delete it
        formData.append("logo", "");
        console.log("Removing logo");
      }

      const response = await authService.updateVendorProfile(formData);
      if (response.success) {
        setSuccess("Restaurant information updated successfully!");
        if (onProfileUpdate) {
          onProfileUpdate(response.data);
        }
        setTimeout(() => {
          setSuccess("");
        }, 3000);
      } else {
        throw new Error(
          response.message || "Failed to update restaurant information"
        );
      }
    } catch (error) {
      console.error("Error updating restaurant information:", error);
      setError(error.message || "Failed to update restaurant information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBillingSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const billingData = {
        billingSettings: {
          taxRate: parseFloat(billingForm.taxRate) || 0,
          serviceChargeRate: parseFloat(billingForm.serviceChargeRate) || 0,
        },
      };

      const response = await authService.updateVendorProfile(billingData);
      if (response.success) {
        setSuccess("Billing settings updated successfully!");
        if (onProfileUpdate) {
          onProfileUpdate(response.data);
        }
        setTimeout(() => {
          setSuccess("");
        }, 3000);
      } else {
        throw new Error(
          response.message || "Failed to update billing settings"
        );
      }
    } catch (error) {
      console.error("Error updating billing settings:", error);
      setError(error.message || "Failed to update billing settings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (success || error) {
      const section = document.getElementById("Alert");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [success, error]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-slate-700 hover:bg-blue-50 hover:text-blue-800"
        >
          <User className="w-4 h-4" />
          Profile Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="restaurant" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Restaurant Info
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Billing Settings
            </TabsTrigger>
          </TabsList>

          {/* Success/Error Messages */}
          {success && (
            <section id="Alert">
              <Alert className="mt-4 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            </section>
          )}

          {error && (
            <section id="Alert">
              <Alert className="mt-4 border-red-200 bg-red-50" id="Alert">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            </section>
          )}

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePersonalSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={personalForm.email}
                      disabled
                      className="bg-slate-50 text-slate-500 cursor-not-allowed"
                      placeholder="Email address cannot be changed"
                    />
                    <p className="text-xs text-slate-500">
                      Email address cannot be changed for security reasons
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="restaurantName">Restaurant Name</Label>
                    <Input
                      id="restaurantName"
                      value={personalForm.restaurantName}
                      onChange={(e) =>
                        handlePersonalChange("restaurantName", e.target.value)
                      }
                      placeholder="Enter your restaurant name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={personalForm.phone}
                      onChange={(e) =>
                        handlePersonalChange("phone", e.target.value)
                      }
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Restaurant Information Tab */}
          <TabsContent value="restaurant" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Restaurant Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVendorSubmit} className="space-y-6">
                  {/* Basic Restaurant Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Basic Information
                    </h3>
                    {/* Logo Upload Section */}
                    <div className="space-y-4">
                      <Label className="flex items-center gap-2">
                        Restaurant Logo
                      </Label>
                      {logoPreview ? (
                        <div className="flex flex-col items-start gap-4">
                          <div className="relative inline-block">
                            <img
                              src={logoPreview}
                              alt="Logo Preview"
                              className="w-32 h-32 object-contain rounded-lg border bg-white p-2"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 w-6 h-6"
                              onClick={removeLogo}
                              disabled={isLoading}
                            >
                              <XIcon className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-sm text-slate-500">
                            Click the X button to remove the logo
                          </p>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                          <Label
                            htmlFor="logo-upload"
                            className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Click to upload logo
                          </Label>
                          <Input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="hidden"
                            disabled={isLoading}
                          />
                          <p className="text-sm text-slate-500 mt-1">
                            PNG, JPG, JPEG up to 1MB
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={vendorForm.description}
                        onChange={(e) =>
                          handleVendorChange("description", e.target.value)
                        }
                        placeholder="Describe your restaurant..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cuisine">Cuisine Type</Label>
                        <Input
                          id="cuisine"
                          value={vendorForm.cuisine}
                          onChange={(e) =>
                            handleVendorChange("cuisine", e.target.value)
                          }
                          placeholder="e.g., Italian, Mexican, Asian"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="restaurantPhone">Phone Number</Label>
                        <Input
                          id="restaurantPhone"
                          type="tel"
                          value={vendorForm.phone}
                          onChange={(e) =>
                            handleVendorChange("phone", e.target.value)
                          }
                          placeholder="Restaurant phone number"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Location
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        value={vendorForm.address}
                        onChange={(e) =>
                          handleVendorChange("address", e.target.value)
                        }
                        placeholder="Enter street address"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={vendorForm.city}
                          onChange={(e) =>
                            handleVendorChange("city", e.target.value)
                          }
                          placeholder="City"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">Province</Label>
                        <Input
                          id="state"
                          value={vendorForm.state}
                          onChange={(e) =>
                            handleVendorChange("state", e.target.value)
                          }
                          placeholder="Province"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">Postal Code</Label>
                        <Input
                          id="zipCode"
                          value={vendorForm.zipCode}
                          onChange={(e) =>
                            handleVendorChange("zipCode", e.target.value)
                          }
                          placeholder="Postal Code"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Settings Tab */}
          <TabsContent value="billing" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Billing Settings
                </CardTitle>
                <p className="text-sm text-slate-600">
                  Configure tax and service charge rates that will be applied to
                  customer orders
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBillingSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Rate Configuration
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="taxRate">Tax Rate (%)</Label>
                        <Input
                          id="taxRate"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={billingForm.taxRate}
                          onChange={(e) =>
                            handleBillingChange("taxRate", e.target.value)
                          }
                          placeholder="0.00"
                        />
                        <p className="text-xs text-slate-500">
                          Percentage of tax to be added to the subtotal (e.g.,
                          8.5 for 8.5%)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="serviceChargeRate">
                          Service Charge Rate (%)
                        </Label>
                        <Input
                          id="serviceChargeRate"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={billingForm.serviceChargeRate}
                          onChange={(e) =>
                            handleBillingChange(
                              "serviceChargeRate",
                              e.target.value
                            )
                          }
                          placeholder="0.00"
                        />
                        <p className="text-xs text-slate-500">
                          Percentage of service charge to be added to the
                          subtotal (e.g., 10 for 10%)
                        </p>
                      </div>
                    </div>

                    {/* Preview Section */}
                    <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                      <h4 className="font-medium text-slate-900">
                        Bill Preview (Example with LKR 1000 subtotal)
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Subtotal</span>
                          <span className="font-medium">LKR 1,000.00</span>
                        </div>
                        {billingForm.taxRate > 0 && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">
                              Tax ({billingForm.taxRate}%)
                            </span>
                            <span className="font-medium">
                              LKR{" "}
                              {((1000 * billingForm.taxRate) / 100).toFixed(2)}
                            </span>
                          </div>
                        )}
                        {billingForm.serviceChargeRate > 0 && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">
                              Service Charge ({billingForm.serviceChargeRate}%)
                            </span>
                            <span className="font-medium">
                              LKR{" "}
                              {(
                                (1000 * billingForm.serviceChargeRate) /
                                100
                              ).toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="border-t pt-2 flex justify-between font-semibold">
                          <span>Total</span>
                          <span>
                            LKR{" "}
                            {(
                              1000 +
                              (1000 * billingForm.taxRate) / 100 +
                              (1000 * billingForm.serviceChargeRate) / 100
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default VendorProfile;
