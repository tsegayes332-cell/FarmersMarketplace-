const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const users = [
  { name: 'Buyer User', email: 'tsegayes332@gmail.com', phone: '+251900000001', password: 'Se1amawi7@', role: 'BUYER' },
  { name: 'Farmer User', email: 'selamawitt759@gmail.com', phone: '+251900000002', password: 'Se1amawi7@', role: 'FARMER' },
  { name: 'Admin User', email: 'admin@farmersmarketplace.com', phone: '+251900000003', password: 'Se1amawi7@', role: 'ADMIN' },
  { name: 'Buyer Demo', email: 'buyer@demo.com', phone: '+251911111111', password: 'Password123!', role: 'BUYER' },
  { name: 'Farmer Demo', email: 'farmer@demo.com', phone: '+251922222222', password: 'Password123!', role: 'FARMER' },
  { name: 'Transporter Demo', email: 'transporter@demo.com', phone: '+251933333333', password: 'Password123!', role: 'TRANSPORTER' }
];

async function main() {
  for (const u of users) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(u.password, salt);
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash, role: u.role, isActive: true },
      create: {
        name: u.name,
        email: u.email,
        phone: u.phone,
        passwordHash,
        role: u.role
      }
    });
    console.log('OK', created.email, created.role, created.id);
  }
}

main()
  .catch((e) => { console.error('FAIL', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
