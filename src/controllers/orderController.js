const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const prisma = new PrismaClient({});

const placeOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive()
  })).min(1),
  address: z.string().optional()
});

const placeOrder = async (req, res) => {
  try {
    const validatedData = placeOrderSchema.parse(req.body);
    const { items, address } = validatedData;
    const buyerId = req.user.id;

    const result = await prisma.$transaction(async (tx) => {
      const orders = [];

      for (const item of items) {
        const { productId, quantity } = item;
        const product = await tx.product.findUnique({ where: { id: productId } });

        if (!product) {
          throw new Error(`Product ${productId} not found`);
        }

        if (product.quantity < quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        const totalPrice = Number(product.price) * quantity;

        await tx.product.update({
          where: { id: productId },
          data: { quantity: product.quantity - quantity }
        });

        const order = await tx.order.create({
          data: {
            buyerId,
            productId,
            quantity,
            totalPrice,
            address,
            status: 'PENDING'
          }
        });

        await tx.notification.create({
          data: {
            userId: product.farmerId,
            type: 'ORDER_UPDATE',
            message: `New order received for ${quantity} of ${product.name}.`
          }
        });

        orders.push(order);
      }

      return orders;
    });

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    if (error.message && (error.message.includes('not found') || error.message.includes('Insufficient'))) {
      return res.status(400).json({ error: error.message });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const orders = await prisma.order.findMany({
      where: { buyerId },
      include: {
        product: true,
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getFarmerOrders = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const orders = await prisma.order.findMany({
      where: {
        product: {
          farmerId: farmerId
        }
      },
      include: {
        product: true,
        buyer: {
          select: { id: true, name: true, email: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateOrderStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'SHIPPED', 'DELIVERED'])
});

const validTransitions = {
  PENDING: ['CONFIRMED'],
  CONFIRMED: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: []
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateOrderStatusSchema.parse(req.body);
    const newStatus = validatedData.status;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { product: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Authorization check
    if (req.user.role === 'FARMER' && order.product.farmerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (req.user.role === 'BUYER' && order.buyerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate status transition
    const allowed = validTransitions[order.status];
    if (!allowed || !allowed.includes(newStatus)) {
      return res.status(400).json({
        error: `Cannot transition from ${order.status} to ${newStatus}. Allowed: ${(allowed || []).join(', ') || 'none'}`
      });
    }

    // Only buyer can mark as DELIVERED
    if (newStatus === 'DELIVERED' && req.user.role !== 'BUYER') {
      return res.status(403).json({ error: 'Only the buyer can confirm delivery' });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: { status: newStatus }
      });

      // Notify the other party
      const notifyUserId = req.user.role === 'FARMER' ? order.buyerId : order.product.farmerId;
      await tx.notification.create({
        data: {
          userId: notifyUserId,
          type: 'ORDER_UPDATE',
          message: `Your order for ${order.product.name} is now ${newStatus}.`
        }
      });

      return updated;
    });

    res.status(200).json(updatedOrder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const trackOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const buyerId = req.user.id;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        transports: true,
        product: true
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.buyerId !== buyerId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getFarmerOrders,
  updateOrderStatus,
  trackOrder
};
