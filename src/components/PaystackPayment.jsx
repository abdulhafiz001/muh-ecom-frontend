import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader, CreditCard } from 'lucide-react';

const PaystackPayment = ({ 
  orderData, 
  email, 
  amount, 
  onSuccess, 
  onError, 
  onClose 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load Paystack script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => {
      console.log('Paystack script loaded');
    };
    script.onerror = () => {
      setError('Failed to load Paystack script');
      setPaymentStatus('failed');
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  const initializePayment = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setPaymentStatus('processing');

      // Generate a unique reference
      const reference = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Use Paystack inline popup
      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_d972eed621b4ce2e30936413914405531d1f7b30',
        email: email,
        amount: amount * 100, // Convert to kobo
        ref: reference,
        currency: 'NGN',
        callback: (response) => {
          // Payment successful
          console.log('Paystack payment successful:', response);
          setPaymentStatus('success');
          if (onSuccess) {
            console.log('Calling onSuccess callback');
            onSuccess(response);
          }
        },
        onClose: () => {
          // Payment cancelled
          setPaymentStatus('cancelled');
          if (onClose) onClose();
        }
      });

      handler.openIframe();
    } catch (err) {
      console.error('Payment initialization failed:', err);
      setError(err.message || 'Payment initialization failed');
      setPaymentStatus('failed');
      if (onError) onError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'processing':
        return <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-12 w-12 text-red-600 mx-auto" />;
      default:
        return <CreditCard className="h-12 w-12 text-gray-600 mx-auto" />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'processing':
        return 'Processing payment...';
      case 'success':
        return 'Payment Successful!';
      case 'failed':
        return 'Payment Failed';
      case 'cancelled':
        return 'Payment Cancelled';
      default:
        return 'Ready to Pay';
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'success':
        return 'text-green-600';
      case 'failed':
      case 'cancelled':
        return 'text-red-600';
      case 'processing':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center">
        <div className="mb-4">
          {getStatusIcon()}
        </div>

        <h3 className={`text-lg font-semibold mb-2 ${getStatusColor()}`}>
          {getStatusMessage()}
        </h3>

        {paymentStatus === 'idle' && (
          <div className="mb-4">
            <p className="text-gray-600 mb-4">Amount: {formatPrice(amount)}</p>
            <button
              onClick={initializePayment}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Pay Now
                </>
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Powered by Paystack. Your payment is secure.
        </p>
      </div>
    </div>
  );
};

export default PaystackPayment;