const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // 1. Mapeamos os setores e definimos o nome de cada playlist correspondente
  const setoresToSeed = [
    { nome: "manutenção",     playlist: "Playlist Manutenção" },
    { nome: "administrativo", playlist: "Playlist Administrativo" },
    { nome: "produção",       playlist: "Playlist Produção" },
    { nome: "diretoria",      playlist: "Playlist Diretoria" },
    { nome: "logistica",      playlist: "Playlist Logistica" },
    { nome: "comercial",      playlist: "Playlist Comercial" }
  ];

  for (const s of setoresToSeed) {
    await prisma.setor.upsert({
      where: { nome: s.nome },
      update: {}, // Mantém como está se o setor já existir
      create: { 
        nome: s.nome,
        // Criando a playlist vinculada usando a relação do seu Schema
        playlists: {
          create: [
            { nome: s.playlist }
          ]
        }
      }
    });
    console.log(`Seeded setor: ${s.nome} com a playlist: ${s.playlist}`);
  }

  // Seed de usuários
  const plain = '123';
  const saltRounds = 10;
  const hash = await bcrypt.hash(plain, saltRounds);

  const users = [
    { username: 'ti', password: hash, role: 'ti' },
    { username: 'administrativo', password: hash, role: 'administrativo' },
    { username: 'diretoria', password: hash, role: 'diretoria' },
    { username: 'logistica', password: hash, role: 'logistica' },
    { username: 'comercial', password: hash, role: 'comercial' },
    { username: 'manutencao', password: hash, role: 'manutencao' },
    { username: 'producao', password: hash, role: 'producao' },
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