import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Users, 
  Plus, 
  Mail, 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Trash2,
  Edit
} from 'lucide-react';
import { authService } from '@/api';

const AccessManagement = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [accessList, setAccessList] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    userEmail: '',
    expiresAt: '',
    notes: ''
  });

  // Fetch access list
  const fetchAccessList = async () => {
    setIsLoadingList(true);
    try {
      const response = await authService.getVendorAccessList(user._id);
      if (response.success) {
        setAccessList(response.data);
      } else {
        setError('Failed to fetch access list');
      }
    } catch (error) {
      console.error('Error fetching access list:', error);
      setError('Failed to fetch access list');
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchAccessList();
    }
  }, [user?._id]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const accessData = {
        userEmail: formData.userEmail,
        expiresAt: formData.expiresAt || null,
        notes: formData.notes
      };

      const response = await authService.grantVendorAccess(accessData);
      if (response.success) {
        setSuccess('Access granted successfully!');
        setFormData({
          userEmail: '',
          expiresAt: '',
          notes: ''
        });
        fetchAccessList(); // Refresh the list
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        throw new Error(response.message || 'Failed to grant access');
      }
    } catch (error) {
      console.error('Error granting access:', error);
      setError(error.message || 'Failed to grant access');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeAccess = async (accessId) => {
    if (!confirm('Are you sure you want to revoke this access?')) return;

    try {
      const response = await authService.revokeVendorAccess(accessId);
      if (response.success) {
        setSuccess('Access revoked successfully!');
        fetchAccessList(); // Refresh the list
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        throw new Error(response.message || 'Failed to revoke access');
      }
    } catch (error) {
      console.error('Error revoking access:', error);
      setError(error.message || 'Failed to revoke access');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'revoked':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Revoked</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getAccessTypeBadge = (accessType) => {
    return (
      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
        Admin Access
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2 text-slate-700 hover:bg-blue-50 hover:text-blue-800">
          <Users className="w-4 h-4" />
          Access Management
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Access Management
          </DialogTitle>
        </DialogHeader>

        {/* Success/Error Messages */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grant Access Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Grant Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userEmail">Email Address *</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={formData.userEmail}
                    onChange={(e) => handleInputChange('userEmail', e.target.value)}
                    placeholder="Enter user's email address"
                    required
                  />
                </div>


                <div className="space-y-2">
                  <Label>Access Type</Label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Admin Access</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      Full access to manage this restaurant including orders, menu, settings, and analytics.
                    </p>
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Granting Access...' : 'Grant Access'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Access List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Current Access Grants
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingList ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-slate-500 mt-2">Loading access list...</p>
                </div>
              ) : accessList.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No access grants yet</p>
                  <p className="text-sm text-slate-400">Grant access to users to manage your restaurant</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {accessList.map((access) => (
                    <div key={access.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Mail className="w-4 h-4 text-slate-500" />
                            <span className="font-medium">{access.userEmail}</span>
                            {getStatusBadge(access.status)}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeAccess(access.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {getAccessTypeBadge(access.accessType)}
                        </div>
                        
                        <div className="text-xs text-slate-500 space-y-1">
                          <p>Granted: {new Date(access.invitedAt).toLocaleDateString()}</p>
                          {access.acceptedAt && (
                            <p>Accepted: {new Date(access.acceptedAt).toLocaleDateString()}</p>
                          )}
                          {access.expiresAt && (
                            <p>Expires: {new Date(access.expiresAt).toLocaleDateString()}</p>
                          )}
                        </div>

                        {access.notes && (
                          <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded">
                            {access.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccessManagement;
