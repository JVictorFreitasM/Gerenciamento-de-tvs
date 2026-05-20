const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // seed setores
  const setoresToSeed = ["administrativo", "comercial", "diretoria"];

  for (const nome of setoresToSeed) {
    await prisma.setor.upsert({
      where: { nome },
      update: {},
      create: { nome }
    });
    console.log(`Seeded setor: ${nome}`);
  }

  const plain = '123';
  const saltRounds = 10;
  const hash = await bcrypt.hash(plain, saltRounds);

  const users = [
    { username: 'ti', password: hash, role: 'ti' },
    { username: 'diretoria', password: hash, role: 'diretoria' }
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: { password: u.password, role: u.role },
      create: u
    });
    console.log(`Seeded user: ${u.username}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
