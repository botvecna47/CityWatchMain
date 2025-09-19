const prisma = require('./services/database');

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        username: true,
        email: true,
        role: true,
        cityId: true
      }
    });
    
    console.log('Users in database:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.email}) - ${user.role} - City: ${user.cityId}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
