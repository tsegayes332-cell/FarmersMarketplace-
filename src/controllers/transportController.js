const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const prisma = new PrismaClient({});

const assignTransporterSchema = z.object({
  transporterId: z.string().uuid(),
  estimatedArrival: z.string().datetime().optional()
});

const updateTransportStatusSchema = z.object({
  status: z.enum(['IN_TRANSIT', 'DELIVERED'])
});

const assignTransporter = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const validatedData = assignTransporterSchema.parse(req.body);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { product: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (req.user.role === 'FARMER' && order.product.farmerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (order.status !== 'CONFIRMED') {
      return res.status(400).json({ error: 'Order must be CONFIRMED before assigning a transporter' });
    }

    const transporter = await prisma.user.findUnique({
      where: { id: validatedData.transporterId }
    });

    if (!transporter || transporter.role !== 'TRANSPORTER') {
      return res.status(400).json({ error: 'Invalid transporter' });
    }

    const transport = await prisma.transport.create({
      data: {
        orderId,
        transporterId: validatedData.transporterId,
        estimatedArrival: validatedData.estimatedArrival ? new Date(validatedData.estimatedArrival) : null
      }
    });

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'SHIPPED' }
      });

      await tx.notification.create({
        data: {
          userId: order.buyerId,
          type: 'ORDER_UPDATE',
          message: `Your order for ${order.product.name} has been shipped.`
        }
      });

      await tx.notification.create({
        data: {
          userId: validatedData.transporterId,
          type: 'ORDER_UPDATE',
          message: `You have been assigned to deliver order ${orderId}.`
        }
      });
    });

    res.status(201).json(transport);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getOrderTransport = async (req, res) => {
  try {
    const { id: orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const transport = await prisma.transport.findFirst({
      where: { orderId },
      include: {
        transporter: {
          select: { id: true, name: true, phone: true }
        }
      }
    });

    if (!transport) {
      return res.status(404).json({ error: 'No transport assigned to this order' });
    }

    res.status(200).json(transport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateTransportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateTransportStatusSchema.parse(req.body);
    const newStatus = validatedData.status;

    const transport = await prisma.transport.findUnique({
      where: { id },
      include: { order: { include: { product: true } } }
    });

    if (!transport) {
      return res.status(404).json({ error: 'Transport record not found' });
    }

    if (transport.transporterId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const validTransitions = {
      PENDING: ['IN_TRANSIT'],
      IN_TRANSIT: ['DELIVERED'],
      DELIVERED: []
    };

    const allowed = validTransitions[transport.status];
    if (!allowed || !allowed.includes(newStatus)) {
      return res.status(400).json({
        error: `Cannot transition from ${transport.status} to ${newStatus}`
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.transport.update({
        where: { id },
        data: { status: newStatus }
      });

      if (newStatus === 'DELIVERED') {
        await tx.order.update({
          where: { id: transport.orderId },
          data: { status: 'DELIVERED' }
        });
      }

      await tx.notification.create({
        data: {
          userId: transport.order.buyerId,
          type: 'ORDER_UPDATE',
          message: `Your order for ${transport.order.product.name} is ${newStatus === 'DELIVERED' ? 'delivered' : 'in transit'}.`
        }
      });

      return result;
    });

    res.status(200).json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMyTransports = async (req, res) => {
  try {
    const transports = await prisma.transport.findMany({
      where: { transporterId: req.user.id },
      include: {
        order: {
          include: {
            product: true,
            buyer: {
              select: { id: true, name: true, phone: true }
            }
          }
        }
      },
      orderBy: { id: 'desc' }
    });

    res.status(200).json(transports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  assignTransporter,
  getOrderTransport,
  updateTransportStatus,
  getMyTransports
};
