import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  GripVertical, 
  AlertCircle, 
  Palette,
  Loader2,
  Check
} from "lucide-react";
import { categoryService } from "@/api/categoryService";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const CATEGORY_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#10b981', '#06b6d4', '#3b82f6'
];

// Sortable Category Item Component
function SortableCategoryItem({ category, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: category.color }}
        />
        <div>
          <h4 className="font-medium">{category.displayName}</h4>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Badge variant="secondary" className="text-xs">
              {category.name}
            </Badge>
            {category.description && (
              <span>• {category.description}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onEdit(category)}
        >
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(category)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function CategoryManagement({ onCategoriesChange }) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    color: "#6366f1",
    icon: ""
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await categoryService.getAll();
      
      if (response.success) {
        setCategories(response.data);
        // Notify parent component of categories change
        if (onCategoriesChange) {
          onCategoriesChange(response.data);
        }
      } else {
        throw new Error(response.message || "Failed to load categories");
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      setError(error.message || "Failed to load categories");
      
      // Try to initialize default categories if none exist
      if (error.message && error.message.includes("no categories")) {
        await initializeDefaultCategories();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const initializeDefaultCategories = async () => {
    try {
      const response = await categoryService.initializeDefaults();
      if (response.success) {
        setCategories(response.data);
        setError("");
        if (onCategoriesChange) {
          onCategoriesChange(response.data);
        }
      }
    } catch (error) {
      console.error("Error initializing default categories:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const categoryData = {
        name: formData.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_'),
        displayName: formData.displayName,
        description: formData.description,
        color: formData.color,
        icon: formData.icon || null,
        sortOrder: editingCategory ? editingCategory.sortOrder : categories.length + 1
      };

      let response;
      if (editingCategory) {
        response = await categoryService.update(editingCategory._id, categoryData);
      } else {
        response = await categoryService.create(categoryData);
      }

      if (response.success) {
        await loadCategories(); // Reload to get updated list
        handleCloseForm();
      } else {
        throw new Error(response.message || "Failed to save category");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      setError(error.message || "Failed to save category");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      displayName: category.displayName,
      description: category.description || "",
      color: category.color || "#6366f1",
      icon: category.icon || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Are you sure you want to delete "${category.displayName}"?`)) {
      return;
    }

    try {
      setError("");
      const response = await categoryService.delete(category._id);
      
      if (response.success) {
        await loadCategories();
      } else {
        throw new Error(response.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      setError(error.message || "Failed to delete category");
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      displayName: "",
      description: "",
      color: "#6366f1",
      icon: ""
    });
    setError("");
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update sortOrder for all items
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          sortOrder: index + 1
        }));
        
        setHasUnsavedChanges(true);
        return updatedItems;
      });
    }
  };

  const handleSaveOrder = async () => {
    try {
      setIsSavingOrder(true);
      setError("");

      const categoryOrders = categories.map((category, index) => ({
        id: category._id,
        sortOrder: index + 1
      }));

      const response = await categoryService.reorder(categoryOrders);
      
      if (response.success) {
        setHasUnsavedChanges(false);
        // Reload categories to get the updated order from server
        await loadCategories();
      } else {
        throw new Error(response.message || "Failed to save category order");
      }
    } catch (error) {
      console.error("Error saving category order:", error);
      setError(error.message || "Failed to save category order");
    } finally {
      setIsSavingOrder(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading categories...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Category Management</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Manage your menu categories. Drag and drop to reorder, then save changes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <Button
                onClick={handleSaveOrder}
                disabled={isSavingOrder}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSavingOrder ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Save Order
              </Button>
            )}
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="e.g., Main Courses"
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Internal Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., main_courses"
                    required
                    disabled={isSaving}
                  />
                  <p className="text-xs text-gray-500">
                    This will be automatically formatted (lowercase, underscores)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this category"
                    rows={2}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2 flex-wrap">
                    {CATEGORY_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                        disabled={isSaving}
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseForm}
                    disabled={isSaving}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {editingCategory ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {error && !showForm && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {categories.length === 0 ? (
          <div className="text-center py-8">
            <Palette className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first category to start organizing your menu items.
            </p>
            <Button onClick={initializeDefaultCategories} variant="outline">
              Initialize Default Categories
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={categories.map(category => category._id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid gap-3">
                {categories.map((category) => (
                  <SortableCategoryItem
                    key={category._id}
                    category={category}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
}
