const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({});

const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const query = {};
    if (role) {
      query.role = role;
    }

    const users = await prisma.user.findMany({
      where: query,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profileImage: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, name: true, isActive: true }
    });

    res.status(200).json({ message: 'User deactivated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        farmer: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const removeProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id }
    });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getReports = async (req, res) => {
  try {
    const [usersByRole, ordersByStatus, payments, topProducts, recentTransactions] = await Promise.all([
      prisma.user.groupBy({
        by: ['role'],
        _count: { id: true }
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      prisma.order.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      }),
      prisma.payment.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } }
      })
    ]);

    // Format top products with names
    const topProductIds = topProducts.map(p => p.productId);
    const productsDetails = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, name: true }
    });
    
    const formattedTopProducts = topProducts.map(tp => ({
      ...tp,
      productName: productsDetails.find(p => p.id === tp.productId)?.name || 'Unknown'
    }));

    res.status(200).json({
      totalUsersByRole: usersByRole,
      totalOrdersByStatus: ordersByStatus,
      totalRevenue: payments._sum.amount || 0,
      topProducts: formattedTopProducts,
      recentTransactions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPlatformStats = async (req, res) => {
  try {
    // Return high-level stats
    const [totalUsers, totalOrders, totalProducts] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.product.count()
    ]);

    res.status(200).json({
      totalUsers,
      totalOrders,
      totalProducts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllUsers,
  deactivateUser,
  getAllProducts,
  removeProduct,
  getReports,
  getPlatformStats
};
