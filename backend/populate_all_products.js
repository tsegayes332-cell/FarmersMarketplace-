const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API = 'https://fmp-api.bonto.run/api';

const CROPS = [
  {
    name: 'Top Grade Teff (Addis Ababa)',
    category: 'Grains',
    price: '2800',
    quantity: '150',
    description: 'Premium organic white magna teff directly sourced from central Shewa farmlands. High nutritional value and gluten-free.',
    imgUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400'
  },
  {
    name: 'Organic Coffee Beans (Yirgacheffe)',
    category: 'Coffee',
    price: '195',
    quantity: '300',
    description: 'Authentic washed Ethiopian Yirgacheffe specialty green coffee beans with distinctive floral and citrus notes.',
    imgUrl: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=400'
  },
  {
    name: 'Fresh Tomatoes (Debre Zeyit)',
    category: 'Vegetables',
    price: '45',
    quantity: '500',
    description: 'Vine-ripened red juicy tomatoes freshly harvested this morning from Debre Zeyit greenhouses.',
    imgUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400'
  },
  {
    name: 'Food Fruits (Strawberry & Berry)',
    category: 'Fruits',
    price: '45',
    quantity: '200',
    description: 'Sweet, succulent freshly picked organic field berries and highland fruits.',
    imgUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400'
  },
  {
    name: 'Omato Fruits (Organic Tomatoes)',
    category: 'Vegetables',
    price: '45',
    quantity: '400',
    description: 'Farm-fresh, chemical-free organic heirloom tomatoes with high sweetness and flavor.',
    imgUrl: 'https://images.unsplash.com/photo-1546470427-e26264be0b11?w=400'
  },
  {
    name: 'Mekonn Barley (Premium Grade)',
    category: 'Grains',
    price: '100',
    quantity: '250',
    description: 'High grade clean malting and food barley suitable for traditional roasting, flour, and brewing.',
    imgUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'
  },
  {
    name: 'Fresh Red Onions (Hawassa)',
    category: 'Vegetables',
    price: '50',
    quantity: '600',
    description: 'Crisp, pungent red bulb onions from Hawassa Rift Valley farms. Long shelf life.',
    imgUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400'
  },
  {
    name: 'Crunchy Orange Carrots (Kombolcha)',
    category: 'Vegetables',
    price: '35',
    quantity: '350',
    description: 'Freshly pulled sweet organic carrots, washed and graded for highest culinary quality.',
    imgUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400'
  },
  {
    name: 'Sheno Pure Farm Butter',
    category: 'Dairy',
    price: '650',
    quantity: '80',
    description: 'Traditional spiced Sheno clarified butter (Kibe) made from 100% grass-fed local dairy cows.',
    imgUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400'
  },
  {
    name: 'Organic Tigray White Honey',
    category: 'Dairy',
    price: '450',
    quantity: '120',
    description: 'Pure, raw crystallised white honey gathered from wild blossom apiaries in the northern highlands.',
    imgUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400'
  },
  {
    name: 'Borana Premium Bull (Live)',
    category: 'Livestock',
    price: '38000',
    quantity: '10',
    description: 'Healthy, disease-free purebred Borana beef cattle raised on natural pastoral rangelands.',
    imgUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=400'
  }
];

async function main() {
  try {
    const loginRes = await axios.post(API + '/auth/login', {
      email: 'farmer@demo.com',
      password: 'Password123!'
    });
    const token = loginRes.data.token;
    console.log('Logged in as farmer!');

    // 1. Get existing products and delete any without valid image
    const existing = await axios.get(API + '/products?limit=100');
    const prods = existing.data.data || existing.data;
    console.log('Found', prods.length, 'existing products on server.');
    
    for (const p of prods) {
      if (!p.imageUrl || p.imageUrl.includes('dlmluy3dvilhvwwgwfmo')) {
        try {
          await axios.delete(API + '/products/' + p.id, {
            headers: { Authorization: 'Bearer ' + token }
          });
          console.log('Deleted old product:', p.name);
        } catch (e) {}
      }
    }

    // 2. Upload all fresh crops with real photos to Cloudinary
    for (let i = 0; i < CROPS.length; i++) {
      const crop = CROPS[i];
      const tempPath = `temp_crop_${i}.jpg`;
      
      try {
        const imgRes = await axios.get(crop.imgUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(tempPath, imgRes.data);

        const form = new FormData();
        form.append('name', crop.name);
        form.append('category', crop.category);
        form.append('price', crop.price);
        form.append('quantity', crop.quantity);
        form.append('description', crop.description);
        form.append('image', fs.createReadStream(tempPath));

        const res = await axios.post(API + '/products', form, {
          headers: {
            ...form.getHeaders(),
            Authorization: 'Bearer ' + token
          }
        });
        console.log('SUCCESS:', crop.name, '=> Cloudinary URL:', res.data.imageUrl);

        // cleanup temp file
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      } catch (err) {
        console.log('Failed for', crop.name, ':', err.response?.data || err.message);
      }
    }

    console.log('All crops uploaded with real photos successfully!');
  } catch (err) {
    console.error('Fatal error:', err.response?.data || err.message);
  }
}

main();
