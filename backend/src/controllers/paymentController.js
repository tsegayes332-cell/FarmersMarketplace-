const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const chapaService = require('../services/chapaService');

const prisma = new PrismaClient({});

const initiatePayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { buyer: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.buyerId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({ error: 'Order is already paid or cancelled' });
    }

    // Split name safely
    const nameParts = order.buyer.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Buyer';

    const callbackUrl = process.env.CHAPA_CALLBACK_URL || `https://your-domain.com/api/payments/webhook`;

    const { checkout_url, tx_ref } = await chapaService.initiatePayment({
      amount: order.totalPrice,
      email: order.buyer.email,
      firstName,
      lastName,
      orderId,
      returnUrl: `http://localhost:3000/orders/${orderId}`,
      callbackUrl
    });

    // Save payment record
    await prisma.payment.create({
      data: {
        orderId,
        userId,
        amount: order.totalPrice,
        method: 'TELEBIRR',
        status: 'PENDING'
      }
    });

    res.status(200).json({ checkout_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

const chapaWebhook = async (req, res) => {
  try {
    const chapaSecret = process.env.CHAPA_SECRET_KEY;
    if (!chapaSecret) {
      return res.status(500).json({ error: 'CHAPA_SECRET_KEY not configured' });
    }

    const rawBody = req.rawBody || JSON.stringify(req.body);

    const hash = crypto.createHmac('sha256', chapaSecret)
                       .update(rawBody)
                       .digest('hex');

    if (hash !== req.headers['chapa-signature'] && hash !== req.headers['x-chapa-signature']) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { tx_ref, status } = req.body;

    // Extract orderId from tx_ref: tx-{orderId}-{timestamp}
    const txParts = tx_ref.split('-');
    const orderId = txParts.length >= 2 ? txParts[1] : null;
    if (!orderId) {
      return res.status(400).json({ error: 'Invalid tx_ref format' });
    }

    // Verify orderId exists before processing
    const existingPayment = await prisma.payment.findFirst({
      where: { orderId },
      orderBy: { createdAt: 'desc' }
    });

    if (existingPayment && existingPayment.status === 'COMPLETED') {
      return res.status(200).json({ message: 'Webhook already processed' });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { product: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (status === 'success') {
      await prisma.$transaction(async (tx) => {
        await tx.payment.updateMany({
          where: { orderId: order.id, status: 'PENDING' },
          data: { status: 'COMPLETED' }
        });

        await tx.order.update({
          where: { id: order.id },
          data: { status: 'CONFIRMED' }
        });

        await tx.notification.create({
          data: {
            userId: order.product.farmerId,
            type: 'PAYMENT_CONFIRMATION',
            message: `Payment received for order ${order.id}. Order is now CONFIRMED.`
          }
        });

        await tx.notification.create({
          data: {
            userId: order.buyerId,
            type: 'PAYMENT_CONFIRMATION',
            message: `Your payment for order ${order.id} was successful.`
          }
        });
      });
    } else {
      await prisma.payment.updateMany({
        where: { orderId: order.id, status: 'PENDING' },
        data: { status: 'FAILED' }
      });
    }

    res.status(200).json({ message: 'Webhook processed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const payment = await prisma.payment.findFirst({
      where: { orderId, userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  initiatePayment,
  chapaWebhook,
  getPaymentStatus
};
