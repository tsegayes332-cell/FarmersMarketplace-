const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const IMAGE_MAP = [
  { match: 'Teff', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80' },
  { match: 'Coffee', url: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=600&q=80' },
  { match: 'Tomatoes', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80' },
  { match: 'Tomato', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80' },
  { match: 'Fruit', url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80' },
  { match: 'Berry', url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80' },
  { match: 'Omato', url: 'https://images.unsplash.com/photo-1546470427-e26264be0b11?auto=format&fit=crop&w=600&q=80' },
  { match: 'Barley', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80' },
  { match: 'Onion', url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80' },
  { match: 'Carrot', url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80' },
  { match: 'Butter', url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80' },
  { match: 'Honey', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80' },
  { match: 'Bull', url: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80' }
];

async function main() {
  try {
    const products = await prisma.product.findMany();
    console.log('Found', products.length, 'products in database');
    for (const p of products) {
      let url = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80';
      for (const m of IMAGE_MAP) {
        if (p.name.toLowerCase().includes(m.match.toLowerCase()) || p.category.toLowerCase().includes(m.match.toLowerCase())) {
          url = m.url;
          break;
        }
      }
      await prisma.product.update({
        where: { id: p.id },
        data: { imageUrl: url }
      });
      console.log('Updated image for:', p.name);
    }
    console.log('Done updating all images!');
  } catch (err) {
    console.error('Error updating images:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
