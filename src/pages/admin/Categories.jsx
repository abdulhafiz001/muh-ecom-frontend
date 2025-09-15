import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package,
  ShoppingBag,
  X
} from 'lucide-react';
import { categoriesAPI, adminProductsAPI, adminCategoriesAPI } from '../../services/api';

const AdminCategories = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    is_active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [categoriesResponse, productsResponse] = await Promise.all([
        categoriesAPI.getAllCategories(),
        adminProductsAPI.getAllProducts()
      ]);

      const categoriesData = categoriesResponse.data.data || [];
      const productsData = productsResponse.data.data || [];

      // Ensure we have arrays
      if (!Array.isArray(categoriesData) || !Array.isArray(productsData)) {
        throw new Error('Invalid data format received from API');
      }

      // Add product count to each category
      const categoriesWithCount = categoriesData.map(category => ({
        ...category,
        productCount: productsData.filter(product => product.category_id === category.id).length
      }));

      setCategories(categoriesWithCount);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleNewCategoryChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewCategory(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Debug: Log the form data being sent
      console.log('Adding category with data:', newCategory);
      
      const formData = new FormData();
      formData.append('name', newCategory.name);
      formData.append('description', newCategory.description || '');
      formData.append('is_active', newCategory.is_active ? '1' : '0');

      // Debug: Log the FormData contents
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      await adminCategoriesAPI.createCategory(formData);
      
      setShowAddModal(false);
      resetNewCategoryForm();
      loadCategories(); // Refresh categories
    } catch (err) {
      console.error('Failed to add category:', err);
      if (err.response?.data?.errors) {
        console.log('Validation errors:', err.response.data.errors);
        setError(`Validation failed: ${Object.values(err.response.data.errors).flat().join(', ')}`);
      } else {
        setError('Failed to add category. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetNewCategoryForm = () => {
    setNewCategory({
      name: '',
      description: '',
      is_active: true
    });
  };

  const handleEditCategory = (category) => {
    setEditingCategory({
      ...category
    });
    setShowEditModal(true);
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Debug: Log the form data being sent
      console.log('Updating category with data:', editingCategory);
      
      const formData = new FormData();
      formData.append('name', editingCategory.name);
      formData.append('description', editingCategory.description || '');
      formData.append('is_active', editingCategory.is_active ? '1' : '0');

      // Debug: Log the FormData contents
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      await adminCategoriesAPI.updateCategory(editingCategory.id, formData);
      
      setShowEditModal(false);
      setEditingCategory(null);
      loadCategories(); // Refresh categories
    } catch (err) {
      console.error('Failed to update category:', err);
      if (err.response?.data?.errors) {
        console.log('Validation errors:', err.response.data.errors);
        setError(`Validation failed: ${Object.values(err.response.data.errors).flat().join(', ')}`);
      } else {
        setError('Failed to update category. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = (category) => {
    setDeletingCategory(category);
    setShowDeleteModal(true);
  };

  const confirmDeleteCategory = async () => {
    if (!deletingCategory) return;
    
    setIsSubmitting(true);
    try {
      await adminCategoriesAPI.deleteCategory(deletingCategory.id);
      
      setShowDeleteModal(false);
      setDeletingCategory(null);
      loadCategories(); // Refresh categories
    } catch (err) {
      console.error('Failed to delete category:', err);
      setError('Failed to delete category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadCategories}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
              <p className="text-gray-600">Manage your product categories</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Category
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(category.is_active ? 'active' : 'inactive')}`}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleEditCategory(category)}
                      className="text-indigo-600 hover:text-indigo-900 p-1"
                      title="Edit Category"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteCategory(category)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Delete Category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{category.description || 'No description available'}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Package className="h-4 w-4 mr-1" />
                    {category.productCount} products
                  </div>
                  <div>{formatDate(category.created_at)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {categories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <ShoppingBag className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first product category</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Category
            </button>
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add New Category</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetNewCategoryForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={newCategory.name}
                  onChange={handleNewCategoryChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={newCategory.description}
                  onChange={handleNewCategoryChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>


              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={newCategory.is_active}
                  onChange={handleNewCategoryChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetNewCategoryForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Adding...' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && editingCategory && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Edit Category</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCategory(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>


              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={editingCategory.is_active}
                  onChange={(e) => setEditingCategory(prev => ({
                    ...prev,
                    is_active: e.target.checked
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Updating...' : 'Update Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingCategory && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Category</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete "{deletingCategory.name}"? This action cannot be undone.
                {deletingCategory.productCount > 0 && (
                  <span className="block text-red-600 mt-2">
                    Warning: This category has {deletingCategory.productCount} products. Deleting it may affect those products.
                  </span>
                )}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingCategory(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteCategory}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
