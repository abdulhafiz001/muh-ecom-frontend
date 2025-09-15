import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, User, Settings, LogOut, Eye, Star, Calendar, MapPin, Truck, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI } from '../services/api';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Load user orders
  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ordersAPI.getUserOrders();
      
      // Debug: Log the response structure
      console.log('Orders API response:', response);
      console.log('Response data:', response.data);
      
      // Handle different response structures
      let ordersData = [];
      if (response.data && response.data.data) {
        // If response has nested data (paginated response)
        ordersData = response.data.data;
        console.log('Using nested data.data:', ordersData);
      } else if (response.data && Array.isArray(response.data)) {
        // If response.data is directly an array
        ordersData = response.data;
        console.log('Using direct response.data array:', ordersData);
      } else if (Array.isArray(response.data)) {
        // If response.data is directly an array
        ordersData = response.data;
        console.log('Using response.data as array:', ordersData);
      }
      
      // Ensure we have an array
      if (!Array.isArray(ordersData)) {
        console.warn('Orders data is not an array:', ordersData);
        ordersData = [];
      }
      
      setOrders(ordersData);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError('Failed to load orders');
      setOrders([]); // Set empty array on error
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'Shipped':
        return <Truck className="h-4 w-4" />;
      case 'Processing':
        return <Package className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.first_name || 'User'}! Manage your account and view your orders.</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="h-5 w-5 text-red-400">⚠</div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button
                  onClick={loadOrders}
                  className="mt-2 text-sm text-red-800 hover:text-red-900 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-xl">
                    {user?.first_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center">{user?.first_name || 'User'}</h3>
                <p className="text-sm text-gray-500 text-center">{user?.email || 'user@example.com'}</p>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Package className="h-5 w-5 mr-3" />
                  My Orders
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="h-5 w-5 mr-3" />
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="h-5 w-5 mr-3" />
                  Settings
                </button>
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Order History</h2>
                  
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading orders...</p>
                    </div>
                  ) : !Array.isArray(orders) || orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                      <p className="text-gray-600 mb-4">Start shopping to see your order history here.</p>
                      <Link
                        to="/products"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Browse Products
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Array.isArray(orders) && orders.length > 0 ? orders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-medium text-gray-900">Order {order.order_number}</h3>
                              <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                <span className="ml-1">{order.status}</span>
                              </span>
                              <span className="text-lg font-semibold text-gray-900">
                                {formatPrice(order.total)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-3">
                            {Array.isArray(order.order_items) && order.order_items.length > 0 ? order.order_items.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                  {item.product?.name || 'Product'} × {item.quantity}
                                </span>
                                <span className="text-gray-900">{formatPrice(item.total)}</span>
                              </div>
                            )) : (
                              <p className="text-sm text-gray-500">No items found</p>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Link
                              to={`/order-confirmation/${order.order_number}`}
                              className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Link>
                            {order.status === 'delivered' && (
                              <button className="inline-flex items-center text-gray-600 hover:text-gray-700 text-sm font-medium">
                                <Star className="h-4 w-4 mr-1" />
                                Write Review
                              </button>
                            )}
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-8">
                          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                          <p className="text-gray-600 mb-4">Start shopping to see your orders here</p>
                          <Link
                            to="/products"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Browse Products
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={user?.first_name || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={user?.last_name || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={user?.phone || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                    
                                          <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                        <input
                          type="text"
                          value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <textarea
                        value={user?.address || ''}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter current password"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter new password"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Update Password
                        </button>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 text-sm text-gray-700">Order updates and shipping notifications</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 text-sm text-gray-700">Promotional emails and special offers</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 text-sm text-gray-700">Newsletter and company updates</span>
                        </label>
                      </div>
                      <div className="mt-4">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Save Preferences
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
