const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const prisma = new PrismaClient({});

const createReviewSchema = z.object({
  targetId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional()
});

const createReview = async (req, res) => {
  try {
    const validatedData = createReviewSchema.parse(req.body);
    const userId = req.user.id;
    const { targetId, rating, comment } = validatedData;

    if (userId === targetId) {
      return res.status(400).json({ error: 'You cannot review yourself' });
    }

    // Check if buyer has a DELIVERED order related to the targetId (farmer or transporter)
    const deliveredOrder = await prisma.order.findFirst({
      where: {
        buyerId: userId,
        status: 'DELIVERED',
        product: { farmerId: targetId }
      }
    });

    const deliveredTransport = await prisma.transport.findFirst({
      where: {
        transporterId: targetId,
        order: {
          buyerId: userId,
          status: 'DELIVERED'
        }
      }
    });

    if (!deliveredOrder && !deliveredTransport) {
      return res.status(403).json({ error: 'You can only review users after a completed order delivery' });
    }

    const review = await prisma.review.create({
      data: {
        userId,
        targetId,
        rating,
        comment
      }
    });

    res.status(201).json(review);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { targetId: userId },
      include: {
        user: {
          select: { id: true, name: true, profileImage: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const aggregate = await prisma.review.aggregate({
      where: { targetId: userId },
      _avg: { rating: true },
      _count: { rating: true }
    });

    res.status(200).json({
      reviews,
      averageRating: aggregate._avg.rating || 0,
      totalReviews: aggregate._count.rating
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createReview,
  getReviews
};
