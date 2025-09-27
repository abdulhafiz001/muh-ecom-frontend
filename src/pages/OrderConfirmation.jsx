import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { CheckCircle, Package, Truck, Home, ShoppingBag, Mail, Phone } from 'lucide-react';
import { ordersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ordersAPI.getOrder(orderId, user?.id);
      setOrder(response.data.data);
    } catch (err) {
      console.error('Failed to load order:', err);
      setError('Failed to load order details');
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

  const formatShippingMethod = (method) => {
    const methods = {
      'standard': 'Standard Shipping',
      'express': 'Express Shipping',
      'overnight': 'Overnight Shipping'
    };
    return methods[method] || 'Standard Shipping';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Order not found'}</p>
          <Link
            to="/"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your order. We've received your payment and will start processing it right away.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
            <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
              {order.status}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Order Number</h3>
              <p className="text-lg font-semibold text-gray-900">{order.order_number}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Order Date</h3>
              <p className="text-lg font-semibold text-gray-900">{new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Payment Method</h3>
              <p className="text-lg font-semibold text-gray-900">{order.payment_method || 'Paystack'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Payment Status</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                order.payment_status === 'completed' 
                  ? 'bg-green-100 text-green-800' 
                  : order.payment_status === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {order.payment_status || 'Pending'}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Amount</h3>
              <p className="text-2xl font-bold text-blue-600">{formatPrice(order.total)}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Items</h2>
          
          <div className="space-y-4">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <img
                  src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=80&h=80&fit=crop'}
                  alt={item.product?.name || 'Product'}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.product?.name || 'Product'}</h3>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatPrice(item.total)}</p>
                  <p className="text-sm text-gray-500">{formatPrice(item.price)} each</p>
                </div>
              </div>
            )) || (
              <p className="text-center text-gray-500 py-4">No items found</p>
            )}
          </div>
        </div>

        {/* Shipping Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center mb-6">
            <Truck className="h-5 w-5 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Shipping Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Shipping Method</h3>
              <p className="text-lg font-semibold text-gray-900">{formatShippingMethod(order.shipping_method)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Estimated Delivery</h3>
              <p className="text-lg font-semibold text-gray-900">{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Shipping Address</h3>
              <p className="text-lg font-semibold text-gray-900">
                {order.shipping_address ? 
                  `${order.shipping_address.first_name} ${order.shipping_address.last_name}, ${order.shipping_address.address}, ${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.postal_code}, ${order.shipping_address.country}` :
                  'Address not available'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">What's Next?</h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                1
              </div>
              <div>
                <h3 className="font-medium text-blue-900">Order Processing</h3>
                <p className="text-blue-700 text-sm">We'll start preparing your order for shipment within 24 hours.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                2
              </div>
              <div>
                <h3 className="font-medium text-blue-900">Shipping Confirmation</h3>
                <p className="text-blue-700 text-sm">You'll receive a shipping confirmation email with tracking information.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                3
              </div>
              <div>
                <h3 className="font-medium text-blue-900">Delivery</h3>
                <p className="text-blue-700 text-sm">Your order will be delivered to your specified address.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Need Help?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <h3 className="font-medium text-gray-900">Email Support</h3>
                <p className="text-gray-600">support@al-anwar.com</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <h3 className="font-medium text-gray-900">Phone Support</h3>
                <p className="text-gray-600">+234 123 456 7890</p>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Our customer support team is available Monday to Friday, 9:00 AM - 6:00 PM WAT.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <Home className="h-5 w-5 mr-2" />
            Continue Shopping
          </Link>
          
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            View Orders
          </Link>
        </div>

        {/* Order Summary */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">Free</span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-lg text-blue-600">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
