const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const defaultAuthorityTypes = [
  {
    name: 'police',
    displayName: 'Police Department',
    icon: '👮',
    description: 'Law enforcement and public safety'
  },
  {
    name: 'fire',
    displayName: 'Fire Department',
    icon: '🚒',
    description: 'Fire suppression and emergency rescue services'
  },
  {
    name: 'medical',
    displayName: 'Medical Services',
    icon: '🏥',
    description: 'Emergency medical services and healthcare'
  },
  {
    name: 'traffic',
    displayName: 'Traffic Control',
    icon: '🚦',
    description: 'Traffic management and road safety'
  },
  {
    name: 'emergency',
    displayName: 'Emergency Services',
    icon: '🚨',
    description: 'General emergency response services'
  },
  {
    name: 'municipal',
    displayName: 'Municipal Services',
    icon: '🏛️',
    description: 'City administration and public services'
  },
  {
    name: 'environmental',
    displayName: 'Environmental Services',
    icon: '🌱',
    description: 'Environmental protection and sustainability'
  },
  {
    name: 'public_works',
    displayName: 'Public Works',
    icon: '🔧',
    description: 'Infrastructure maintenance and development'
  },
  {
    name: 'animal_control',
    displayName: 'Animal Control',
    icon: '🐕',
    description: 'Animal welfare and control services'
  },
  {
    name: 'building_inspection',
    displayName: 'Building Inspection',
    icon: '🏗️',
    description: 'Building safety and code compliance'
  }
];

async function seedAuthorityTypes() {
  try {
    console.log('🌱 Seeding authority types...');

    for (const authorityType of defaultAuthorityTypes) {
      // Check if authority type already exists
      const existing = await prisma.authorityType.findFirst({
        where: {
          OR: [
            { name: authorityType.name },
            { displayName: authorityType.displayName }
          ]
        }
      });

      if (!existing) {
        await prisma.authorityType.create({
          data: authorityType
        });
        console.log(`✅ Created authority type: ${authorityType.displayName}`);
      } else {
        console.log(`⏭️  Authority type already exists: ${authorityType.displayName}`);
      }
    }

    console.log('🎉 Authority types seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding authority types:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAuthorityTypes();


