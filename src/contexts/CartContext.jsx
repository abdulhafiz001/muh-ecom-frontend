import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // For now, we'll work without authentication
  // Later we can integrate with AuthContext when needed
  const isAuthenticated = false;

  // Load cart items when component mounts
  useEffect(() => {
    loadCart(); // Load cart from API when component mounts
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await cartAPI.getCart();
      setCartItems(response.data.data.items || []);
    } catch (err) {
      console.error('Failed to load cart:', err);
      setError('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      await cartAPI.addToCart(productId, quantity);
      await loadCart(); // Reload cart to get updated data
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add item to cart';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      setLoading(true);
      setError(null);
      
      await cartAPI.updateCartItem(itemId, quantity);
      await loadCart(); // Reload cart to get updated data
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update cart item';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      setError(null);
      
      await cartAPI.removeFromCart(itemId);
      await loadCart(); // Reload cart to get updated data
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to remove item from cart';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await cartAPI.clearCart();
      setCartItems([]);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to clear cart';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  // Calculate cart totals
  const cartTotal = cartItems.reduce((total, item) => {
    const price = item.product.sale_price || item.product.price;
    return total + (price * item.quantity);
  }, 0);

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const value = {
    cartItems,
    cartTotal,
    cartCount,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    clearError,
    loadCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
