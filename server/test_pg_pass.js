const { PrismaClient } = require('@prisma/client');

async function test() {
  const url = 'postgresql://postgres:password@localhost:5432/postgres?schema=public';
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    await prisma.$connect();
    console.log('🎉🎉🎉 SUCCESS CONNECTED WITH USER postgres AND PASSWORD "password"!');
    await prisma.$disconnect();
  } catch (e) {
    console.log('❌ Error:', e.message);
  }
}

test();
