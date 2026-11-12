const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ where: { email: { in: ['tsegayes332@gmail.comt', 'selamawitt759@gmail.com'] } } });
  for (const u of users) {
    console.log('Email: ' + u.email);
    for (const pw of ['test123', '123456', 'password', 'selamawit', 'Selamawit', 'Mihiret', '12345678', 'selamawitt759']) {
      const match = await bcrypt.compare(pw, u.passwordHash);
      if (match) console.log('  => Password is: "' + pw + '"');
    }
  }
  await prisma.$disconnect();
}
main().catch(console.error);
