#!/usr/bin/env node

/**
 * Sample Data Seeder for CityWatch
 * 
 * This script creates sample data for testing the citizens dashboard
 * Run with: node seed-sample-data.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedSampleData() {
  console.log('🌱 Seeding sample data for CityWatch...\n');

  try {
    // First, let's check if we have any cities
    const cities = await prisma.city.findMany();
    console.log(`📍 Found ${cities.length} cities`);

    if (cities.length === 0) {
      console.log('❌ No cities found. Please run the main seed script first.');
      return;
    }

    // Get the first city for sample data
    const sampleCity = cities[0];
    console.log(`🏙️ Using city: ${sampleCity.name}`);

    // Check if we have any users
    const users = await prisma.user.findMany({
      where: { cityId: sampleCity.id }
    });
    console.log(`👥 Found ${users.length} users in ${sampleCity.name}`);

    if (users.length === 0) {
      console.log('❌ No users found in the city. Please create users first.');
      return;
    }

    const sampleUser = users[0];
    console.log(`👤 Using user: ${sampleUser.username}`);

    // Create sample reports
    console.log('\n📝 Creating sample reports...');
    const sampleReports = [
      {
        title: 'Broken Street Light on Main Street',
        description: 'The street light at the intersection of Main Street and Oak Avenue has been flickering and completely went out last night. This creates a safety hazard for pedestrians and drivers.',
        category: 'POWER',
        status: 'OPEN',
        latitude: 40.7128,
        longitude: -74.0060,
        authorId: sampleUser.id,
        cityId: sampleCity.id
      },
      {
        title: 'Pothole on Elm Street',
        description: 'Large pothole has formed on Elm Street near the school. It\'s getting deeper and could damage vehicles. Needs immediate attention.',
        category: 'ROAD',
        status: 'IN_PROGRESS',
        latitude: 40.7130,
        longitude: -74.0058,
        authorId: sampleUser.id,
        cityId: sampleCity.id
      },
      {
        title: 'Garbage Collection Missed',
        description: 'Garbage collection was missed on our street this week. Bins are overflowing and creating a mess.',
        category: 'GARBAGE',
        status: 'RESOLVED',
        latitude: 40.7125,
        longitude: -74.0062,
        authorId: sampleUser.id,
        cityId: sampleCity.id
      },
      {
        title: 'Water Leak in Park',
        description: 'There\'s a water leak in the central park fountain. Water is pooling around the area and could cause damage.',
        category: 'WATER',
        status: 'OPEN',
        latitude: 40.7132,
        longitude: -74.0055,
        authorId: sampleUser.id,
        cityId: sampleCity.id
      },
      {
        title: 'Damaged Sidewalk',
        description: 'The sidewalk on Pine Street has cracked and is uneven. It\'s difficult for people with mobility issues to navigate.',
        category: 'ROAD',
        status: 'OPEN',
        latitude: 40.7120,
        longitude: -74.0065,
        authorId: sampleUser.id,
        cityId: sampleCity.id
      }
    ];

    for (const reportData of sampleReports) {
      const existingReport = await prisma.report.findFirst({
        where: {
          title: reportData.title,
          authorId: reportData.authorId
        }
      });

      if (!existingReport) {
        const report = await prisma.report.create({
          data: reportData
        });
        console.log(`  ✅ Created report: ${report.title}`);
      } else {
        console.log(`  ⏭️ Report already exists: ${reportData.title}`);
      }
    }

    // Create sample events
    console.log('\n📅 Creating sample events...');
    const sampleEvents = [
      {
        title: 'Community Cleanup Day',
        description: 'Join us for a community cleanup day in the central park. We\'ll provide gloves, bags, and refreshments. All ages welcome!',
        dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        location: 'Central Park',
        createdBy: sampleUser.id,
        cityId: sampleCity.id
      },
      {
        title: 'City Council Meeting',
        description: 'Monthly city council meeting to discuss upcoming infrastructure projects and community concerns.',
        dateTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        location: 'City Hall',
        createdBy: sampleUser.id,
        cityId: sampleCity.id
      },
      {
        title: 'Street Festival',
        description: 'Annual street festival featuring local vendors, food trucks, and live music. Fun for the whole family!',
        dateTime: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        location: 'Main Street',
        createdBy: sampleUser.id,
        cityId: sampleCity.id
      }
    ];

    for (const eventData of sampleEvents) {
      const existingEvent = await prisma.event.findFirst({
        where: {
          title: eventData.title,
          createdBy: eventData.createdBy
        }
      });

      if (!existingEvent) {
        const event = await prisma.event.create({
          data: eventData
        });
        console.log(`  ✅ Created event: ${event.title}`);
      } else {
        console.log(`  ⏭️ Event already exists: ${eventData.title}`);
      }
    }

    // Create sample alerts (need authority user)
    console.log('\n🚨 Creating sample alerts...');
    const authorityUser = await prisma.user.findFirst({
      where: {
        role: 'authority',
        cityId: sampleCity.id
      }
    });

    if (authorityUser) {
      const sampleAlerts = [
        {
          title: 'Road Construction Alert',
          message: 'Road construction will begin on Oak Avenue starting Monday. Expect delays and use alternate routes.',
          isPinned: true,
          createdBy: authorityUser.id,
          cityId: sampleCity.id
        },
        {
          title: 'Water Main Repair',
          message: 'Emergency water main repair on Pine Street. Water service may be interrupted for 2-3 hours.',
          isPinned: false,
          createdBy: authorityUser.id,
          cityId: sampleCity.id
        }
      ];

      for (const alertData of sampleAlerts) {
        const existingAlert = await prisma.alert.findFirst({
          where: {
            title: alertData.title,
            createdBy: alertData.createdBy
          }
        });

        if (!existingAlert) {
          const alert = await prisma.alert.create({
            data: alertData
          });
          console.log(`  ✅ Created alert: ${alert.title}`);
        } else {
          console.log(`  ⏭️ Alert already exists: ${alertData.title}`);
        }
      }
    } else {
      console.log('  ⚠️ No authority user found. Skipping alert creation.');
      console.log('  💡 Create an authority user to see alerts in the dashboard.');
    }

    // Add some comments to reports to make them "trending"
    console.log('\n💬 Adding comments to reports...');
    const reports = await prisma.report.findMany({
      where: { cityId: sampleCity.id },
      take: 3
    });

    for (const report of reports) {
      const existingComment = await prisma.comment.findFirst({
        where: {
          reportId: report.id,
          authorId: sampleUser.id
        }
      });

      if (!existingComment) {
        await prisma.comment.create({
          data: {
            content: `Thanks for reporting this! I've noticed the same issue.`,
            reportId: report.id,
            authorId: sampleUser.id
          }
        });
        console.log(`  ✅ Added comment to report: ${report.title}`);
      }
    }

    console.log('\n🎉 Sample data seeding completed!');
    console.log('\n📊 Summary:');
    console.log(`   📝 Reports: ${await prisma.report.count({ where: { cityId: sampleCity.id } })}`);
    console.log(`   📅 Events: ${await prisma.event.count({ where: { cityId: sampleCity.id } })}`);
    console.log(`   🚨 Alerts: ${await prisma.alert.count({ where: { cityId: sampleCity.id } })}`);
    console.log(`   💬 Comments: ${await prisma.comment.count()}`);

  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
seedSampleData();
