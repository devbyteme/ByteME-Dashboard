import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save, Loader2, AlertCircle, Upload, X as XIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Category } from "@/api";

export default function MenuItemForm({ item, onSave, onCancel, isSaving = false }) {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    description: item?.description || "",
    price: item?.price || "",
    category: item?.category || "",
    image: item?.image || "",
    available: item?.available ?? true,
    dietary_info: item?.dietary_info || [],
    preparationTime: item?.preparationTime || ""
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(item?.image || "");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const dietaryOptions = ["vegetarian", "vegan", "gluten-free", "dairy-free", "nut-free", "spicy"];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError("");
      const response = await Category.list();
      
      if (response.success) {
        setCategories(response.data);
        
        if (!item && !formData.category && response.data.length > 0) {
          setFormData(prev => ({ ...prev, category: response.data[0].name }));
        }
      } else {
        throw new Error(response.message || "Failed to load categories");
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      setCategoriesError(error.message || "Failed to load categories");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (1MB limit)
      if (file.size > 1 * 1024 * 1024) {
        alert('Image size must be less than 1MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData(prev => ({ ...prev, image: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create FormData object for file upload
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', parseFloat(formData.price));
    formDataToSend.append('category', formData.category);
    formDataToSend.append('available', formData.available);
    formDataToSend.append('preparationTime', formData.preparationTime ? parseInt(formData.preparationTime) : '');
    formDataToSend.append('dietary_info', JSON.stringify(formData.dietary_info));
    
    // Append image file if selected
    if (imageFile) {
      formDataToSend.append('image', imageFile);
    } else if (!formData.image && item?.image) {
      // If image was removed, send empty string
      formDataToSend.append('image', '');
    }
    
    onSave(formDataToSend);
  };

  const handleDietaryChange = (option, checked) => {
    setFormData(prev => ({
      ...prev,
      dietary_info: checked 
        ? [...prev.dietary_info, option]
        : prev.dietary_info.filter(info => info !== option)
    }));
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{item ? 'Edit Menu Item' : 'Add New Menu Item'}</span>
          <Button variant="ghost" size="icon" onClick={onCancel} disabled={isSaving}>
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Grilled Salmon"
                required
                disabled={isSaving}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price (LKR)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="0.00"
                required
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe the dish..."
              rows={3}
              required
              disabled={isSaving}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              {categoriesError && (
                <Alert variant="destructive" className="mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{categoriesError}</AlertDescription>
                </Alert>
              )}
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({...formData, category: value})}
                disabled={isSaving || categoriesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category._id} value={category.name}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.displayName}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {categories.length === 0 && !categoriesLoading && !categoriesError && (
                <p className="text-sm text-gray-500">
                  No categories found. Create categories first in Category Management.
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="preparationTime">Prep Time (minutes)</Label>
              <Input
                id="preparationTime"
                type="number"
                min="0"
                value={formData.preparationTime}
                onChange={(e) => setFormData({...formData, preparationTime: e.target.value})}
                placeholder="15"
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label htmlFor="image">Item Image</Label>
            <div>

            {imagePreview ? (
              <div className="relative inline-block">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-32 h-32 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 w-6 h-6"
                  onClick={removeImage}
                >
                  <XIcon className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <Label 
                  htmlFor="image-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-700"
                >
                  Click to upload image
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isSaving}
                />
                <p className="text-sm text-gray-500 mt-1">
                  PNG, JPG, JPEG up to 1MB
                </p>
              </div>
            )}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Dietary Information</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {dietaryOptions.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={option}
                    checked={formData.dietary_info?.includes(option)}
                    onCheckedChange={(checked) => handleDietaryChange(option, checked)}
                    disabled={isSaving}
                  />
                  <Label htmlFor={option} className="text-sm capitalize">
                    {option.replace('-', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="available"
              checked={formData.available}
              onCheckedChange={(checked) => setFormData({...formData, available: checked})}
              disabled={isSaving}
            />
            <Label htmlFor="available">Available for ordering</Label>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1 gap-2" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {item ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {item ? 'Update Item' : 'Add Item'}
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={isSaving}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}