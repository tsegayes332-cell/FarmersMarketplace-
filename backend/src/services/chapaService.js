const chapaInstance = require('../config/chapa');

const initiatePayment = async ({ amount, email, firstName, lastName, orderId, returnUrl, callbackUrl }) => {
  const tx_ref = `tx-${orderId}-${Date.now()}`;
  
  const payload = {
    amount: amount.toString(),
    currency: 'ETB',
    email,
    first_name: firstName,
    last_name: lastName,
    tx_ref,
    callback_url: callbackUrl,
    return_url: returnUrl,
    customization: {
      title: 'Farmers Marketplace Payment',
      description: `Payment for order ${orderId}`
    }
  };

  try {
    const response = await chapaInstance.post('/transaction/initialize', payload);
    return {
      checkout_url: response.data.data.checkout_url,
      tx_ref
    };
  } catch (error) {
    throw new Error('Payment initialization failed: ' + (error.response?.data?.message || error.message));
  }
};

const verifyPayment = async (tx_ref) => {
  try {
    const response = await chapaInstance.get(`/transaction/verify/${tx_ref}`);
    return response.data;
  } catch (error) {
    throw new Error('Payment verification failed: ' + (error.response?.data?.message || error.message));
  }
};

module.exports = {
  initiatePayment,
  verifyPayment
};
