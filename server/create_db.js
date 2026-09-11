const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient({
    datasources: { db: { url: 'postgresql://postgres@127.0.0.1:5433/postgres?schema=public' } },
  });
  try {
    await prisma.$executeRawUnsafe('CREATE DATABASE velozity_db;');
    console.log('🎉 CREATED DATABASE velozity_db SUCCESSFULLY!');
  } catch (e) {
    if (e.message.includes('already exists')) {
      console.log('✅ velozity_db already exists.');
    } else {
      console.error('Error:', e.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
