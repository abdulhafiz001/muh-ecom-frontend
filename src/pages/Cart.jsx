import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const Cart = () => {
  const { cartItems, loading, error, updateCartItem, removeFromCart, cartTotal, cartCount } = useCart();

  const formatPrice = (price) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(price);
};

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await updateCartItem(itemId, newQuantity);
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <ShoppingBag className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added any products to your cart yet.</p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">Review your items and proceed to checkout</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Cart Items ({cartItems.length})
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150&h=150&fit=crop'}
                          alt={item.product?.name || 'Product'}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              {item.product?.name || 'Product'}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>SKU: {item.product?.sku || 'N/A'}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="px-3 py-1 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="px-3 py-1 text-gray-900 font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="px-3 py-1 hover:bg-gray-50"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-gray-900">
                                {formatPrice((item.product?.sale_price || item.product?.price || 0) * item.quantity)}
                              </span>
                              {item.product?.sale_price && (
                                <span className="text-sm text-gray-500 line-through">
                                  {formatPrice((item.product?.price || 0) * item.quantity)}
                                </span>
                              )}
                            </div>
                            {item.product?.sale_price && (
                              <span className="text-sm text-green-600 font-medium">
                                Save {formatPrice(((item.product?.price || 0) - (item.product?.sale_price || 0)) * item.quantity)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="mt-6">
              <Link
                to="/products"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal ({cartCount} items)</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Including VAT</p>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                to="/checkout"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center block"
              >
                Proceed to Checkout
              </Link>

              {/* Additional Info */}
              <div className="mt-6 text-sm text-gray-500 space-y-2">
                <p>✓ Free shipping on orders over $50</p>
                <p>✓ Secure payment processing</p>
                <p>✓ 30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
