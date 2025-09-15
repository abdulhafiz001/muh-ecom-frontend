import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Grid, List, Filter, Search, Star, ShoppingCart, Eye } from 'lucide-react';
import { productsAPI, categoriesAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('latest');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
      loadProductsByCategory(category);
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load categories and products in parallel
      const [categoriesResponse, productsResponse] = await Promise.all([
        categoriesAPI.getAll(),
        productsAPI.getAll()
      ]);
      
      setCategories(['All', ...categoriesResponse.data.data.map(cat => cat.name)]);
      setProducts(productsResponse.data.data.data || []);
    } catch (err) {
      console.error('Failed to load products data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadProductsByCategory = async (categoryName) => {
    try {
      setLoading(true);
      setError(null);
      
      if (categoryName === 'All') {
        const response = await productsAPI.getAll();
        setProducts(response.data.data.data || []);
      } else {
        // Find category ID by name
        const category = categories.find(cat => cat === categoryName);
        if (category && category !== 'All') {
          const response = await productsAPI.getByCategory(category.id);
          setProducts(response.data.data.data || []);
        }
      }
    } catch (err) {
      console.error('Failed to load products by category:', err);
      setError('Failed to load products. Please try again later.');
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

  const handleAddToCart = async (productId) => {
    try {
      const result = await addToCart(productId, 1);
      if (result.success) {
        // You can add a success notification here if needed
        console.log('Product added to cart successfully');
      } else {
        console.error('Failed to add product to cart:', result.error);
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
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

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === '' || selectedCategory === 'All' || 
                           product.category?.name === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = (product.sale_price || product.price) >= priceRange[0] && 
                        (product.sale_price || product.price) <= priceRange[1];
    
    return matchesCategory && matchesSearch && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.sale_price || a.price) - (b.sale_price || b.price);
      case 'price-high':
        return (b.sale_price || b.price) - (a.sale_price || a.price);
      case 'rating':
        return 4.5 - 4.5; // Default rating for now
      case 'latest':
      default:
        return b.id - a.id;
    }
  });

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ category: category.toLowerCase().replace(' ', '-') });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
          <p className="text-gray-600">Discover our complete collection of quality products</p>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
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

            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="lg:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="latest">Latest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (₦)</label>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                placeholder="Min"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 100000])}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {sortedProducts.length} of {products.length} products
          </p>
        </div>

        {/* Products Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative overflow-hidden">
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop'}
                    alt={product.name}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {product.sale_price && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        {Math.round(((product.price - product.sale_price) / product.price) * 100)}% OFF
                      </span>
                    </div>
                  )}
                  {product.stock_quantity <= 0 && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      {product.category?.name || 'General'}
                    </span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">4.5</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(product.sale_price || product.price)}
                      </span>
                      {product.sale_price && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/products/${product.id}`}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Link>
                    <button 
                      onClick={() => handleAddToCart(product.id)}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={product.stock_quantity <= 0}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-48">
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop'}
                      alt={product.name}
                      className="w-full h-32 md:h-48 object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          {product.category?.name || 'General'}
                        </span>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {product.name}
                        </h3>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">4.5</span>
                        <span className="text-xs text-gray-400 ml-1">(25)</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {formatPrice(product.sale_price || product.price)}
                        </span>
                        {product.sale_price && (
                          <span className="text-lg text-gray-500 line-through">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          to={`/products/${product.id}`}
                          className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                        <button 
                          onClick={() => handleAddToCart(product.id)}
                          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={product.stock_quantity <= 0}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {sortedProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
