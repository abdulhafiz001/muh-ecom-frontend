import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { ordersAPI, productsAPI, categoriesAPI, adminProductsAPI } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenueChange: 0,
    ordersChange: 0,
    customersChange: 0,
    productsChange: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load orders, products, and categories in parallel
      const [ordersResponse, productsResponse, categoriesResponse] = await Promise.all([
        ordersAPI.getAllOrders(),
        adminProductsAPI.getAllProducts(),
        categoriesAPI.getAllCategories()
      ]);

      const orders = ordersResponse.data.data || [];
      const products = productsResponse.data.data || [];
      const categories = categoriesResponse.data.data || [];

      // Ensure we have arrays
      if (!Array.isArray(orders) || !Array.isArray(products) || !Array.isArray(categories)) {
        throw new Error('Invalid data format received from API');
      }

      // Calculate stats
      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
      const totalOrders = orders.length;
      const totalProducts = products.length;
      const totalCustomers = new Set(orders.map(order => order.user_id)).size;

      setStats({
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        revenueChange: 12.5, // Placeholder - would need historical data
        ordersChange: -2.3,  // Placeholder - would need historical data
        customersChange: 8.7, // Placeholder - would need historical data
        productsChange: 15.2  // Placeholder - would need historical data
      });

      // Set recent orders (last 5)
      setRecentOrders(orders.slice(0, 5).map(order => ({
        id: order.order_number,
        customer: order.user?.first_name + ' ' + order.user?.last_name || 'Unknown',
        amount: parseFloat(order.total || 0),
        status: order.status,
        date: order.created_at
      })));

      // Set top products (placeholder - would need sales analytics)
      setTopProducts(products.slice(0, 3).map(product => ({
        name: product.name,
        sales: Math.floor(Math.random() * 50) + 10, // Placeholder
        revenue: parseFloat(product.price || 0) * (Math.floor(Math.random() * 50) + 10), // Placeholder
        image: product.images?.[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=60&h=60&fit=crop'
      })));

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data');
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
          <p className="text-gray-600">Loading dashboard...</p>
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
            onClick={loadDashboardData}
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

  const StatCard = ({ title, value, change, icon: Icon, changeType }) => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        {changeType === 'positive' ? (
          <ArrowUpRight className="h-4 w-4 text-green-500" />
        ) : (
          <ArrowDownRight className="h-4 w-4 text-red-500" />
        )}
        <span className={`text-sm font-medium ml-1 ${
          changeType === 'positive' ? 'text-green-600' : 'text-red-600'
        }`}>
          {change > 0 ? '+' : ''}{change}%
        </span>
        <span className="text-sm text-gray-500 ml-2">from last month</span>
      </div>
    </div>
  );

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your admin dashboard. Here's what's happening with your store.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={formatPrice(stats.totalRevenue)}
            change={stats.revenueChange}
            icon={DollarSign}
            changeType={stats.revenueChange > 0 ? 'positive' : 'negative'}
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            change={stats.ordersChange}
            icon={ShoppingCart}
            changeType={stats.ordersChange > 0 ? 'positive' : 'negative'}
          />
          <StatCard
            title="Total Customers"
            value={stats.totalCustomers}
            change={stats.customersChange}
            icon={Users}
            changeType={stats.customersChange > 0 ? 'positive' : 'negative'}
          />
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            change={stats.productsChange}
            icon={Package}
            changeType={stats.productsChange > 0 ? 'positive' : 'negative'}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View all
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{order.id}</p>
                        <p className="text-sm text-gray-500">{order.customer}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatPrice(order.amount)}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{formatDate(order.date)}</p>
                      <button className="text-blue-600 hover:text-blue-700 text-sm">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Top Selling Products</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View all
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={`${product.name}-${index}`} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.sales} units sold</p>
                      </div>
                    </div>
                    
                    <div className="text-right ml-auto">
                      <p className="font-medium text-gray-900">{formatPrice(product.revenue)}</p>
                      <p className="text-sm text-green-600">+{Math.round((product.revenue / 1000000) * 100)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
              <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900">Add Product</p>
              <p className="text-sm text-gray-500">Create new product listing</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
              <ShoppingCart className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900">View Orders</p>
              <p className="text-sm text-gray-500">Check order status</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900">Manage Users</p>
              <p className="text-sm text-gray-500">Customer accounts</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900">View Reports</p>
              <p className="text-sm text-gray-500">Analytics & insights</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
