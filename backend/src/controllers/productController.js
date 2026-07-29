const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const prisma = new PrismaClient({});

// Schemas for validation
const createProductSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  price: z.coerce.number().positive(),
  quantity: z.coerce.number().int().positive(),
  description: z.string().min(10)
});

const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  category: z.string().min(2).optional(),
  price: z.coerce.number().positive().optional(),
  quantity: z.coerce.number().int().positive().optional(),
  description: z.string().min(10).optional()
});

const createProduct = async (req, res) => {
  try {
    const validatedData = createProductSchema.parse(req.body);
    let imageUrl = null;
    
    if (req.file && req.file.filename) {
      imageUrl = 'uploads/' + req.file.filename;
    }

    const newProduct = await prisma.product.create({
      data: {
        ...validatedData,
        imageUrl,
        farmerId: req.user.id
      }
    });

    res.status(201).json(newProduct);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, page = 1, limit = 10 } = req.query;
    
    const query = {
      where: {}
    };

    if (category) {
      query.where.category = category;
    }

    if (minPrice || maxPrice) {
      query.where.price = {};
      const minVal = Number(minPrice);
      const maxVal = Number(maxPrice);
      if (minPrice && !isNaN(minVal)) query.where.price.gte = minVal;
      if (maxPrice && !isNaN(maxVal)) query.where.price.lte = maxVal;
    }

    if (search) {
      query.where.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: query.where,
        skip,
        take,
        include: {
          farmer: {
            select: { id: true, name: true, email: true, phone: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where: query.where })
    ]);

    res.status(200).json({
      data: products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        farmer: {
          select: { id: true, name: true, email: true, phone: true, profileImage: true }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateProductSchema.parse(req.body);

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.farmerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You can only update your own products.' });
    }

    let imageUrl = product.imageUrl;
    if (req.file && req.file.filename) {
      imageUrl = 'uploads/' + req.file.filename;
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...validatedData,
        imageUrl
      }
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.farmerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. You cannot delete this product.' });
    }

    await prisma.product.delete({
      where: { id }
    });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
