import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Filter,
  MoreVertical,
  Package,
  X,
  Upload
} from 'lucide-react';
import { adminProductsAPI, categoriesAPI } from '../../services/api';

const AdminProducts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const generateUniqueSKU = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `PROD-${timestamp}-${random}`;
  };

  const [newProduct, setNewProduct] = useState({
    name: '',
    category_id: '',
    sku: generateUniqueSKU(),
    stock_quantity: 0,
    price: 0,
    sale_price: '',
    is_active: true,
    is_featured: false,
    description: '',
    images: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [productsResponse, categoriesResponse] = await Promise.all([
        adminProductsAPI.getAllProducts(),
        categoriesAPI.getAllCategories()
      ]);

      setProducts(productsResponse.data.data || []);
      setCategories(categoriesResponse.data.data || []);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load products and categories');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
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
            onClick={loadData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleNewProductChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setNewProduct(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setNewProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Frontend validation
      if (!newProduct.name.trim()) {
        setError('Product name is required');
        return;
      }
      
      if (!newProduct.category_id) {
        setError('Please select a category');
        return;
      }
      
      if (!newProduct.sku.trim()) {
        setError('SKU is required');
        return;
      }
      
      if (parseFloat(newProduct.price) <= 0) {
        setError('Price must be greater than 0');
        return;
      }
      
      if (newProduct.sale_price && parseFloat(newProduct.sale_price) >= parseFloat(newProduct.price)) {
        setError('Sale price must be less than regular price');
        return;
      }
      
      if (parseInt(newProduct.stock_quantity) < 0) {
        setError('Stock quantity cannot be negative');
        return;
      }
      
      if (!newProduct.description.trim()) {
        setError('Product description is required');
        return;
      }

      // Debug: Log the form data being sent
      console.log('Adding product with data:', newProduct);
      
      const formData = new FormData();
      formData.append('name', newProduct.name.trim());
      formData.append('category_id', parseInt(newProduct.category_id));
      formData.append('sku', newProduct.sku.trim());
      formData.append('stock_quantity', parseInt(newProduct.stock_quantity));
      formData.append('price', parseFloat(newProduct.price));
      if (newProduct.sale_price && newProduct.sale_price !== '' && parseFloat(newProduct.sale_price) > 0) {
        formData.append('sale_price', parseFloat(newProduct.sale_price));
      }
      formData.append('is_active', newProduct.is_active ? '1' : '0');
      formData.append('is_featured', newProduct.is_featured ? '1' : '0');
      formData.append('description', newProduct.description.trim());

      // Debug: Log the FormData contents
      console.log('FormData before adding images:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      console.log('Adding images to FormData:', newProduct.images);
      newProduct.images.forEach((image, index) => {
        console.log(`Adding image ${index}:`, image.name || image, 'Type:', typeof image);
        formData.append('images[]', image);
      });

      console.log('FormData after adding images:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      await adminProductsAPI.createProduct(formData);
      setShowAddModal(false);
      resetNewProductForm();
      loadData(); // Refresh products
    } catch (err) {
      console.error('Failed to add product:', err);
      if (err.response?.data?.errors) {
        console.log('Validation errors:', err.response.data.errors);
        setError(`Validation failed: ${Object.values(err.response.data.errors).flat().join(', ')}`);
      } else {
        setError('Failed to add product. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetNewProductForm = () => {
    setNewProduct({
      name: '',
      category_id: '',
      sku: generateUniqueSKU(),
      stock_quantity: 0,
      price: 0,
      sale_price: '',
      is_active: true,
      is_featured: false,
      description: '',
      images: []
    });
  };

  const handleEditProduct = (product) => {
    setEditingProduct({
      ...product,
      sale_price: product.sale_price || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Frontend validation
      if (!editingProduct.name.trim()) {
        setError('Product name is required');
        return;
      }
      
      if (!editingProduct.category_id) {
        setError('Please select a category');
        return;
      }
      
      if (!editingProduct.sku.trim()) {
        setError('SKU is required');
        return;
      }
      
      if (parseFloat(editingProduct.price) <= 0) {
        setError('Price must be greater than 0');
        return;
      }
      
      if (editingProduct.sale_price && parseFloat(editingProduct.sale_price) >= parseFloat(editingProduct.price)) {
        setError('Sale price must be less than regular price');
        return;
      }
      
      if (parseInt(editingProduct.stock_quantity) < 0) {
        setError('Stock quantity cannot be negative');
        return;
      }
      
      if (!editingProduct.description.trim()) {
        setError('Product description is required');
        return;
      }

      // Debug: Log the form data being sent
      console.log('Updating product with data:', editingProduct);
      
      const formData = new FormData();
      formData.append('name', editingProduct.name.trim());
      formData.append('category_id', parseInt(editingProduct.category_id));
      formData.append('sku', editingProduct.sku.trim());
      formData.append('stock_quantity', parseInt(editingProduct.stock_quantity));
      formData.append('price', parseFloat(editingProduct.price));
      if (editingProduct.sale_price && editingProduct.sale_price !== '' && parseFloat(editingProduct.sale_price) > 0) {
        formData.append('sale_price', parseFloat(editingProduct.sale_price));
      }
      formData.append('is_active', editingProduct.is_active ? '1' : '0');
      formData.append('is_featured', editingProduct.is_featured ? '1' : '0');
      formData.append('description', editingProduct.description.trim());

      // Debug: Log the FormData contents
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      await adminProductsAPI.updateProduct(editingProduct.id, formData);
      setShowEditModal(false);
      setEditingProduct(null);
      loadData(); // Refresh products
    } catch (err) {
      console.error('Failed to update product:', err);
      if (err.response?.data?.errors) {
        console.log('Validation errors:', err.response.data.errors);
        setError(`Validation failed: ${Object.values(err.response.data.errors).flat().join(', ')}`);
      } else {
        setError('Failed to update product. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = (product) => {
    setDeletingProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDeleteProduct = async () => {
    if (!deletingProduct) return;
    
    setIsSubmitting(true);
    try {
      await adminProductsAPI.deleteProduct(deletingProduct.id);
      setShowDeleteModal(false);
      setDeletingProduct(null);
      loadData(); // Refresh products
    } catch (err) {
      console.error('Failed to delete product:', err);
      setError('Failed to delete product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleProductStatus = async (product) => {
    try {
      const formData = new FormData();
      formData.append('name', product.name.trim());
      formData.append('description', product.description.trim());
      formData.append('price', parseFloat(product.price));
      if (product.sale_price && product.sale_price !== '' && parseFloat(product.sale_price) > 0) {
        formData.append('sale_price', parseFloat(product.sale_price));
      }
      formData.append('stock_quantity', parseInt(product.stock_quantity));
      formData.append('sku', product.sku.trim());
      formData.append('category_id', parseInt(product.category_id));
      formData.append('is_active', !product.is_active ? '1' : '0');
      formData.append('is_featured', product.is_featured ? '1' : '0');
      
      await adminProductsAPI.updateProduct(product.id, formData);
      loadData(); // Refresh products
    } catch (err) {
      console.error('Failed to toggle product status:', err);
      if (err.response?.data?.errors) {
        console.log('Validation errors:', err.response.data.errors);
        setError(`Validation failed: ${Object.values(err.response.data.errors).flat().join(', ')}`);
      } else {
        setError('Failed to update product status. Please try again.');
      }
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600">Manage your product catalog</p>
            </div>
            <button
              onClick={() => {
                resetNewProductForm();
                setShowAddModal(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Product
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Products ({filteredProducts.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={product.images?.[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=80&h=80&fit=crop'}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">ID: {product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {product.category?.name || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatPrice(product.sale_price || product.price)}</div>
                      {product.sale_price && (
                        <div className="text-sm text-gray-500 line-through">
                          {formatPrice(product.price)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.stock_quantity}</div>
                      {product.stock_quantity === 0 && (
                        <div className="text-sm text-red-500">Out of stock</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.is_active ? 'active' : 'inactive')}`}>
                        {product.is_active ? 'active' : 'inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(product.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => toggleProductStatus(product)}
                          className={`px-2 py-1 text-xs rounded-full ${
                            product.is_active 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                          title={product.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {product.is_active ? 'Active' : 'Inactive'}
                        </button>
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Package className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first product'
              }
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Product
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add New Product</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetNewProductForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                                     <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Product Name *
                     </label>
                     <input
                       type="text"
                       name="name"
                       value={newProduct.name}
                       onChange={handleNewProductChange}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="Enter product name"
                       required
                     />
                   </div>

                                     <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Category *
                     </label>
                     <select
                       name="category_id"
                       value={newProduct.category_id}
                       onChange={handleNewProductChange}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                       required
                     >
                       <option value="">Select Category</option>
                       {categories.map(category => (
                         <option key={category.id} value={category.id}>
                           {category.name}
                         </option>
                       ))}
                     </select>
                     {categories.length === 0 && (
                       <p className="text-xs text-red-500 mt-1">No categories available. Please create a category first.</p>
                     )}
                   </div>

                                     <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       SKU * (Stock Keeping Unit)
                     </label>
                     <input
                       type="text"
                       name="sku"
                       value={newProduct.sku}
                       onChange={handleNewProductChange}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="e.g., AIR-001, FRESH-2024"
                       required
                     />
                     <p className="text-xs text-gray-500 mt-1">A unique identifier for your product</p>
                   </div>

                                     <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Stock Quantity *
                     </label>
                     <input
                       type="number"
                       name="stock_quantity"
                       value={newProduct.stock_quantity}
                       onChange={handleNewProductChange}
                       min="0"
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="Enter available quantity"
                       required
                     />
                   </div>
                </div>

                {/* Pricing and Status */}
                <div className="space-y-4">
                                     <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Regular Price *
                     </label>
                     <input
                       type="number"
                       name="price"
                       value={newProduct.price}
                       onChange={handleNewProductChange}
                       min="0.01"
                       step="0.01"
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                       required
                     />
                   </div>

                                     <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Sale Price
                     </label>
                     <input
                       type="number"
                       name="sale_price"
                       value={newProduct.sale_price}
                       onChange={handleNewProductChange}
                       min="0.01"
                       step="0.01"
                       max={newProduct.price > 0 ? newProduct.price - 0.01 : undefined}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="Must be less than regular price"
                     />
                   </div>

                                     <div className="flex items-center space-x-4">
                     <label className="flex items-center">
                       <input
                         type="checkbox"
                         name="is_active"
                         checked={newProduct.is_active}
                         onChange={handleNewProductChange}
                         className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                       />
                       <span className="ml-2 text-sm text-gray-700">Active</span>
                     </label>

                     <label className="flex items-center">
                       <input
                         type="checkbox"
                         name="is_featured"
                         checked={newProduct.is_featured}
                         onChange={handleNewProductChange}
                         className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                       />
                       <span className="ml-2 text-sm text-gray-700">Featured</span>
                     </label>
                   </div>
                   <p className="text-xs text-gray-500">Active products are visible to customers. Featured products appear in special sections.</p>
                </div>
              </div>

                             {/* Description */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Description *
                 </label>
                 <textarea
                   name="description"
                   value={newProduct.description}
                   onChange={handleNewProductChange}
                   rows={4}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                   placeholder="Describe your product in detail..."
                   required
                 />
               </div>

                             {/* Images */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Product Images
                 </label>
                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                   <input
                     type="file"
                     multiple
                     accept="image/*"
                     onChange={handleImageUpload}
                     className="hidden"
                     id="image-upload"
                   />
                   <label htmlFor="image-upload" className="cursor-pointer">
                     <div className="space-y-2">
                       <div className="text-gray-400">
                         <Upload className="h-8 w-8 mx-auto" />
                       </div>
                       <div className="text-sm text-gray-600">
                         <span className="font-medium text-blue-600 hover:text-blue-500">
                           Click to upload
                         </span> or drag and drop
                       </div>
                       <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                     </div>
                   </label>
                 </div>
                 {newProduct.images.length > 0 && (
                   <div className="mt-4 grid grid-cols-4 gap-2">
                     {newProduct.images.map((image, index) => (
                       <div key={index} className="relative">
                         <img
                           src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                           alt={`Preview ${index + 1}`}
                           className="w-full h-20 object-cover rounded-lg"
                         />
                         <button
                           type="button"
                           onClick={() => removeImage(index)}
                           className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                         >
                           ×
                         </button>
                       </div>
                     ))}
                   </div>
                 )}
                 <p className="text-xs text-gray-500 mt-2">Images are optional but recommended for better product presentation</p>
               </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetNewProductForm();
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
                  {isSubmitting ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Edit Product</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProduct(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                                     <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Product Name *
                     </label>
                     <input
                       type="text"
                       name="name"
                       value={editingProduct.name}
                       onChange={(e) => setEditingProduct(prev => ({
                         ...prev,
                         name: e.target.value
                       }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="Enter product name"
                       required
                     />
                   </div>

                                     <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Category *
                     </label>
                     <select
                       name="category_id"
                       value={editingProduct.category_id}
                       onChange={(e) => setEditingProduct(prev => ({
                         ...prev,
                         category_id: e.target.value
                       }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                       required
                     >
                       <option value="">Select Category</option>
                       {categories.map(category => (
                         <option key={category.id} value={category.id}>
                           {category.name}
                         </option>
                       ))}
                     </select>
                     {categories.length === 0 && (
                       <p className="text-xs text-red-500 mt-1">No categories available. Please create a category first.</p>
                     )}
                   </div>

                                     <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       SKU * (Stock Keeping Unit)
                     </label>
                     <input
                       type="text"
                       name="sku"
                       value={editingProduct.sku}
                       onChange={(e) => setEditingProduct(prev => ({
                         ...prev,
                         sku: e.target.value
                       }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="e.g., AIR-001, FRESH-2024"
                       required
                     />
                     <p className="text-xs text-gray-500 mt-1">A unique identifier for your product</p>
                   </div>

                                     <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Stock Quantity *
                     </label>
                     <input
                       type="number"
                       name="stock_quantity"
                       value={editingProduct.stock_quantity}
                       onChange={(e) => setEditingProduct(prev => ({
                         ...prev,
                         stock_quantity: parseInt(e.target.value)
                       }))}
                       min="0"
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="Enter available quantity"
                       required
                     />
                   </div>
                </div>

                {/* Pricing and Status */}
                <div className="space-y-4">
                                     <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Regular Price *
                     </label>
                     <input
                       type="number"
                       name="price"
                       value={editingProduct.price}
                       onChange={(e) => setEditingProduct(prev => ({
                         ...prev,
                         price: parseFloat(e.target.value)
                       }))}
                       min="0.01"
                       step="0.01"
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                       required
                     />
                   </div>

                                     <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Sale Price
                     </label>
                     <input
                       type="number"
                       name="sale_price"
                       value={editingProduct.sale_price}
                       onChange={(e) => setEditingProduct(prev => ({
                         ...prev,
                         sale_price: e.target.value
                       }))}
                       min="0.01"
                       step="0.01"
                       max={editingProduct.price > 0 ? editingProduct.price - 0.01 : undefined}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="Must be less than regular price"
                     />
                   </div>

                                     <div className="flex items-center space-x-4">
                     <label className="flex items-center">
                       <input
                         type="checkbox"
                         name="is_active"
                         checked={editingProduct.is_active}
                         onChange={(e) => setEditingProduct(prev => ({
                           ...prev,
                           is_active: e.target.checked
                         }))}
                         className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                       />
                       <span className="ml-2 text-sm text-gray-700">Active</span>
                     </label>

                     <label className="flex items-center">
                       <input
                         type="checkbox"
                         name="is_featured"
                         checked={editingProduct.is_featured}
                         onChange={(e) => setEditingProduct(prev => ({
                           ...prev,
                           is_featured: e.target.checked
                         }))}
                         className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                       />
                       <span className="ml-2 text-sm text-gray-700">Featured</span>
                     </label>
                   </div>
                   <p className="text-xs text-gray-500">Active products are visible to customers. Featured products appear in special sections.</p>
                </div>
              </div>

                             {/* Description */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Description *
                 </label>
                 <textarea
                   name="description"
                   value={editingProduct.description}
                   onChange={(e) => setEditingProduct(prev => ({
                     ...prev,
                     description: e.target.value
                   }))}
                   rows={4}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                   placeholder="Describe your product in detail..."
                   required
                 />
               </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProduct(null);
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
                  {isSubmitting ? 'Updating...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Product</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete "{deletingProduct.name}"? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingProduct(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteProduct}
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

export default AdminProducts;
