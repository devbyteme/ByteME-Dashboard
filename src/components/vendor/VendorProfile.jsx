import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  User, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Save, 
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { authService } from '@/api';

const VendorProfile = ({ user, onProfileUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('personal');

  // Personal Information Form
  const [personalForm, setPersonalForm] = useState({
    email: '',
    phone: '',
    restaurantName: ''
  });

  // Vendor Information Form
  const [vendorForm, setVendorForm] = useState({
    description: '',
    cuisine: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  // Initialize forms with user data
  useEffect(() => {
    if (user) {
      setPersonalForm({
        email: user.email || '',
        phone: user.phone || '',
        restaurantName: user.name || user.restaurantName || ''
      });

      setVendorForm({
        description: user.description || '',
        cuisine: user.cuisine || '',
        phone: user.phone || '',
        address: user.location?.address || '',
        city: user.location?.city || '',
        state: user.location?.state || '',
        zipCode: user.location?.zipCode || ''
      });
    }
  }, [user]);

  const handlePersonalChange = (field, value) => {
    setPersonalForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVendorChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setVendorForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setVendorForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };


  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update both personal info and restaurant name
      const personalData = {
        phone: personalForm.phone
      };

      const response = await authService.updateProfile(personalData);
      if (response.success) {
        // Also update the restaurant name
        const vendorData = {
          name: personalForm.restaurantName
        };
        
        const vendorResponse = await authService.updateVendorProfile(vendorData);
        if (vendorResponse.success) {
          setSuccess('Personal information updated successfully!');
          if (onProfileUpdate) {
            onProfileUpdate({ ...response.data, ...vendorResponse.data });
          }
        } else {
          throw new Error(vendorResponse.message || 'Failed to update restaurant name');
        }
        
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        throw new Error(response.message || 'Failed to update personal information');
      }
    } catch (error) {
      console.error('Error updating personal information:', error);
      setError(error.message || 'Failed to update personal information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const vendorData = {
        description: vendorForm.description,
        cuisine: vendorForm.cuisine,
        phone: vendorForm.phone,
        location: {
          address: vendorForm.address,
          city: vendorForm.city,
          state: vendorForm.state,
          zipCode: vendorForm.zipCode
        }
      };

      const response = await authService.updateVendorProfile(vendorData);
      if (response.success) {
        setSuccess('Restaurant information updated successfully!');
        if (onProfileUpdate) {
          onProfileUpdate(response.data);
        }
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        throw new Error(response.message || 'Failed to update restaurant information');
      }
    } catch (error) {
      console.error('Error updating restaurant information:', error);
      setError(error.message || 'Failed to update restaurant information');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2 text-slate-700 hover:bg-blue-50 hover:text-blue-800">
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="restaurant" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Restaurant Info
            </TabsTrigger>
          </TabsList>

          {/* Success/Error Messages */}
          {success && (
            <Alert className="mt-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
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
                    <p className="text-xs text-slate-500">Email address cannot be changed for security reasons</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="restaurantName">Restaurant Name</Label>
                    <Input
                      id="restaurantName"
                      value={personalForm.restaurantName}
                      onChange={(e) => handlePersonalChange('restaurantName', e.target.value)}
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
                      onChange={(e) => handlePersonalChange('phone', e.target.value)}
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
                      {isLoading ? 'Saving...' : 'Save Changes'}
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
                    <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>
                    

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={vendorForm.description}
                        onChange={(e) => handleVendorChange('description', e.target.value)}
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
                          onChange={(e) => handleVendorChange('cuisine', e.target.value)}
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
                          onChange={(e) => handleVendorChange('phone', e.target.value)}
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
                        onChange={(e) => handleVendorChange('address', e.target.value)}
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
                          onChange={(e) => handleVendorChange('city', e.target.value)}
                          placeholder="City"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={vendorForm.state}
                          onChange={(e) => handleVendorChange('state', e.target.value)}
                          placeholder="State"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          value={vendorForm.zipCode}
                          onChange={(e) => handleVendorChange('zipCode', e.target.value)}
                          placeholder="ZIP Code"
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
                      {isLoading ? 'Saving...' : 'Save Changes'}
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
