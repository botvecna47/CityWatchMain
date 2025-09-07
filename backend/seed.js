// Seed script to create test data
const prisma = require('./services/database');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Create cities
    console.log('Creating cities...');
    const cityA = await prisma.city.create({
      data: {
        name: 'Test City A',
        slug: 'city-a'
      }
    });
    console.log(`✅ Created city: ${cityA.name}`);

    const cityB = await prisma.city.create({
      data: {
        name: 'Test City B',
        slug: 'city-b'
      }
    });
    console.log(`✅ Created city: ${cityB.name}`);

    // Create admin user
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash('P@ssw0rd1', 12);
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        cityId: cityA.id
      }
    });
    console.log(`✅ Created admin user: ${admin.username}`);

    // Create test citizens
    console.log('Creating test citizens...');
    const alice = await prisma.user.create({
      data: {
        username: 'alice',
        email: 'alice@example.com',
        password: hashedPassword,
        role: 'citizen',
        cityId: cityA.id
      }
    });
    console.log(`✅ Created citizen: ${alice.username} in ${cityA.name}`);

    const bob = await prisma.user.create({
      data: {
        username: 'bob',
        email: 'bob@example.com',
        password: hashedPassword,
        role: 'citizen',
        cityId: cityA.id
      }
    });
    console.log(`✅ Created citizen: ${bob.username} in ${cityA.name}`);

    const carl = await prisma.user.create({
      data: {
        username: 'carl',
        email: 'carl@example.com',
        password: hashedPassword,
        role: 'citizen',
        cityId: cityB.id
      }
    });
    console.log(`✅ Created citizen: ${carl.username} in ${cityB.name}`);

    // Create authority user
    const authority = await prisma.user.create({
      data: {
        username: 'authority_user',
        email: 'authority@example.com',
        password: hashedPassword,
        role: 'authority',
        cityId: cityA.id
      }
    });
    console.log(`✅ Created authority: ${authority.username} in ${cityA.name}`);

    // Create a test report
    console.log('Creating test report...');
    const report = await prisma.report.create({
      data: {
        title: 'Garbage at 5th Street',
        description: 'Large pile of garbage near the market causing health concerns',
        category: 'GARBAGE',
        cityId: cityA.id,
        authorId: alice.id
      }
    });
    console.log(`✅ Created report: ${report.title}`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Test Data Created:');
    console.log(`🏙️ Cities: ${cityA.name}, ${cityB.name}`);
    console.log(`👤 Users: admin, alice, bob, carl, authority_user`);
    console.log(`📄 Report: ${report.title}`);
    console.log('\n🔑 Test Credentials (password: P@ssw0rd1):');
    console.log('Admin: admin@example.com');
    console.log('Citizen (City A): alice@example.com, bob@example.com');
    console.log('Citizen (City B): carl@example.com');
    console.log('Authority (City A): authority@example.com');

  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
