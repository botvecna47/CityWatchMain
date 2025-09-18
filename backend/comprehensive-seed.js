const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Maharashtra cities
const maharashtraCities = [
  { id: 'mumbai', name: 'Mumbai', slug: 'mumbai' },
  { id: 'pune', name: 'Pune', slug: 'pune' },
  { id: 'nagpur', name: 'Nagpur', slug: 'nagpur' },
  { id: 'nashik', name: 'Nashik', slug: 'nashik' },
  { id: 'aurangabad', name: 'Aurangabad', slug: 'aurangabad' }
];

// More demo users
const demoUsers = [
  // Mumbai users
  { username: 'Rajesh_Kumar', email: 'rajesh.kumar@email.com', role: 'citizen', cityId: 'mumbai' },
  { username: 'Priya_Sharma', email: 'priya.sharma@email.com', role: 'citizen', cityId: 'mumbai' },
  { username: 'Amit_Patil', email: 'amit.patil@email.com', role: 'citizen', cityId: 'mumbai' },
  { username: 'Sneha_Desai', email: 'sneha.desai@email.com', role: 'citizen', cityId: 'mumbai' },
  { username: 'Vikram_Singh', email: 'vikram.singh@email.com', role: 'citizen', cityId: 'mumbai' },
  { username: 'Mumbai_Police', email: 'police.mumbai@maharashtra.gov.in', role: 'authority', cityId: 'mumbai' },
  { username: 'BMC_Official', email: 'bmc.official@mumbai.gov.in', role: 'authority', cityId: 'mumbai' },
  { username: 'Mumbai_Admin', email: 'admin.mumbai@citywatch.in', role: 'admin', cityId: 'mumbai' },
  
  // Pune users
  { username: 'Pune_Citizen', email: 'citizen.pune@email.com', role: 'citizen', cityId: 'pune' },
  { username: 'Pune_Police', email: 'police.pune@maharashtra.gov.in', role: 'authority', cityId: 'pune' },
  { username: 'Pune_Admin', email: 'admin.pune@citywatch.in', role: 'admin', cityId: 'pune' }
];

// More realistic reports for Mumbai
const mumbaiReports = [
  {
    title: 'Pothole on Linking Road causing traffic jam',
    description: 'Large pothole near KFC outlet on Linking Road, Bandra West. Vehicles are getting stuck and causing major traffic congestion during peak hours. Need immediate repair.',
    category: 'ROAD',
    status: 'IN_PROGRESS',
    latitude: 19.0596,
    longitude: 72.8295
  },
  {
    title: 'Street light not working near Juhu Beach',
    description: 'Multiple street lights are not working on the road leading to Juhu Beach. This creates safety issues for pedestrians and vehicles during evening hours.',
    category: 'OTHER',
    status: 'OPEN',
    latitude: 19.1077,
    longitude: 72.8263
  },
  {
    title: 'Garbage collection issue in Andheri West',
    description: 'Garbage has not been collected for 3 days in Sector 7, Andheri West. The area is becoming unhygienic and attracting stray animals.',
    category: 'GARBAGE',
    status: 'RESOLVED',
    latitude: 19.1136,
    longitude: 72.8697
  },
  {
    title: 'Water logging at Powai Lake area',
    description: 'Heavy water logging near Powai Lake after yesterday\'s rain. Vehicles are unable to pass through the area. Need urgent drainage work.',
    category: 'WATER',
    status: 'IN_PROGRESS',
    latitude: 19.1176,
    longitude: 72.9060
  },
  {
    title: 'Illegal parking near Malad station',
    description: 'Cars are parked illegally on both sides of the road near Malad railway station, blocking traffic and causing inconvenience to commuters.',
    category: 'ROAD',
    status: 'OPEN',
    latitude: 19.1868,
    longitude: 72.8486
  },
  {
    title: 'Broken footpath in Goregaon East',
    description: 'Footpath near Goregaon railway station is broken and uneven. Elderly people and children are finding it difficult to walk safely.',
    category: 'ROAD',
    status: 'OPEN',
    latitude: 19.1550,
    longitude: 72.8497
  },
  {
    title: 'Stray dogs menace in Santacruz East',
    description: 'Large number of stray dogs in residential area near Santacruz East. They are aggressive and causing fear among residents, especially children.',
    category: 'OTHER',
    status: 'IN_PROGRESS',
    latitude: 19.0880,
    longitude: 72.8650
  },
  {
    title: 'Noise pollution from construction site',
    description: 'Construction work going on 24/7 near Vile Parle West residential area. Heavy machinery noise is disturbing residents, especially during night hours.',
    category: 'OTHER',
    status: 'OPEN',
    latitude: 19.0990,
    longitude: 72.8423
  },
  {
    title: 'Sewage overflow in Dadar West',
    description: 'Sewage water is overflowing onto the main road in Dadar West. The smell is unbearable and it\'s a health hazard for residents.',
    category: 'WATER',
    status: 'RESOLVED',
    latitude: 19.0176,
    longitude: 72.8562
  },
  {
    title: 'Traffic signal not working at Matunga',
    description: 'Traffic signal at Matunga East junction is not working properly. This is causing traffic chaos and potential accidents during peak hours.',
    category: 'ROAD',
    status: 'IN_PROGRESS',
    latitude: 19.0176,
    longitude: 72.8562
  },
  {
    title: 'Power outage in Kurla West',
    description: 'Power has been out for 4 hours in Kurla West area. Residents are facing difficulties, especially elderly people who need medical equipment.',
    category: 'POWER',
    status: 'OPEN',
    latitude: 19.0669,
    longitude: 72.8825
  },
  {
    title: 'Water supply interruption in Ghatkopar',
    description: 'No water supply in Ghatkopar West for the past 2 days. Residents are struggling to get water for daily needs.',
    category: 'WATER',
    status: 'IN_PROGRESS',
    latitude: 19.0880,
    longitude: 72.9080
  }
];

// More events for Mumbai
const mumbaiEvents = [
  {
    title: 'Mumbai Marathon 2024',
    description: 'Annual Mumbai Marathon starting from CST. Route includes Marine Drive, Bandra-Worli Sea Link, and ends at Bandra Kurla Complex. Road closures expected from 6 AM to 2 PM.',
    dateTime: new Date('2024-01-21T06:00:00Z'),
    location: 'CST to BKC Route'
  },
  {
    title: 'Ganesh Chaturthi Festival',
    description: 'Annual Ganesh Chaturthi celebrations across Mumbai. Large processions expected in Lalbaug, Girgaon, and other areas. Traffic diversions in place.',
    dateTime: new Date('2024-09-07T08:00:00Z'),
    location: 'Various locations across Mumbai'
  },
  {
    title: 'Mumbai Film Festival',
    description: 'International Film Festival of India (IFFI) screenings at various venues including NCPA, Regal Cinema, and PVR. Special screenings and celebrity appearances.',
    dateTime: new Date('2024-11-20T10:00:00Z'),
    location: 'NCPA, Regal Cinema, PVR'
  },
  {
    title: 'Monsoon Preparedness Workshop',
    description: 'BMC organized workshop for residents on monsoon preparedness. Learn about flood safety, emergency contacts, and preventive measures.',
    dateTime: new Date('2024-05-15T14:00:00Z'),
    location: 'BMC Headquarters, Fort'
  },
  {
    title: 'Clean Mumbai Drive',
    description: 'Community beach cleaning drive at Juhu Beach. Join us to keep Mumbai clean. Gloves and cleaning equipment will be provided.',
    dateTime: new Date('2024-06-05T07:00:00Z'),
    location: 'Juhu Beach'
  },
  {
    title: 'Mumbai Food Festival',
    description: 'Annual food festival featuring local street food vendors and restaurants. Experience the diverse culinary culture of Mumbai.',
    dateTime: new Date('2024-03-15T11:00:00Z'),
    location: 'Gateway of India, Colaba'
  }
];

// More alerts for Mumbai
const mumbaiAlerts = [
  {
    title: 'Heavy Rain Alert - Mumbai',
    message: 'IMD has issued heavy rain warning for Mumbai and suburbs. Avoid unnecessary travel. Stay away from low-lying areas. Emergency helpline: 1916'
  },
  {
    title: 'Traffic Diversion - Bandra-Worli Sea Link',
    message: 'Sea Link will be closed for maintenance from 11 PM to 5 AM for the next 3 days. Use alternative routes via Mahim Causeway or Vashi Bridge.'
  },
  {
    title: 'Water Supply Interruption - Western Suburbs',
    message: 'Water supply will be interrupted in Andheri, Juhu, and Versova areas from 10 AM to 6 PM tomorrow due to pipeline maintenance. Store water accordingly.'
  },
  {
    title: 'Ganpati Visarjan - Traffic Advisory',
    message: 'Heavy traffic expected during Ganpati visarjan processions. Avoid Marine Drive, Girgaon Chowpatty, and Juhu Beach areas. Use public transport.'
  },
  {
    title: 'Mumbai Marathon - Road Closures',
    message: 'Road closures in effect for Mumbai Marathon. Avoid CST, Marine Drive, and BKC areas from 6 AM to 2 PM. Use alternative routes.'
  }
];

async function comprehensiveSeed() {
  try {
    console.log('🌱 Starting comprehensive seed...');

    // Create cities
    console.log('🏙️ Creating Maharashtra cities...');
    for (const city of maharashtraCities) {
      await prisma.city.upsert({
        where: { id: city.id },
        update: {},
        create: city
      });
    }

    // Create users
    console.log('👥 Creating demo users...');
    const createdUsers = [];
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    for (const user of demoUsers) {
      const createdUser = await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          ...user,
          password: hashedPassword
        }
      });
      createdUsers.push(createdUser);
    }

    // Create reports
    console.log('📝 Creating realistic reports...');
    const mumbaiCitizens = createdUsers.filter(u => u.role === 'citizen' && u.cityId === 'mumbai');
    const mumbaiAuthorities = createdUsers.filter(u => u.role === 'authority' && u.cityId === 'mumbai');
    
    for (let i = 0; i < mumbaiReports.length; i++) {
      const report = mumbaiReports[i];
      const randomUser = mumbaiCitizens[Math.floor(Math.random() * mumbaiCitizens.length)];
      
      const createdReport = await prisma.report.create({
        data: {
          ...report,
          author: {
            connect: { id: randomUser.id }
          },
          city: {
            connect: { id: 'mumbai' }
          }
        }
      });

      // Add authority updates for resolved/in-progress reports
      if (report.status === 'RESOLVED' || report.status === 'IN_PROGRESS') {
        const randomAuthority = mumbaiAuthorities[Math.floor(Math.random() * mumbaiAuthorities.length)];
        
        await prisma.authorityUpdate.create({
          data: {
            report: {
              connect: { id: createdReport.id }
            },
            authority: {
              connect: { id: randomAuthority.id }
            },
            text: report.status === 'RESOLVED' 
              ? 'Issue has been resolved. Our team has completed the necessary repairs and the area is now safe for public use.'
              : 'We have received your report and our team is currently working on resolving this issue. We will provide updates as work progresses.',
            newStatus: report.status
          }
        });
      }

      // Add some comments
      if (Math.random() > 0.5) {
        const randomCommenter = mumbaiCitizens[Math.floor(Math.random() * mumbaiCitizens.length)];
        await prisma.comment.create({
          data: {
            report: {
              connect: { id: createdReport.id }
            },
            author: {
              connect: { id: randomCommenter.id }
            },
            content: 'Thanks for reporting this issue. I have also noticed this problem in the area.'
          }
        });
      }
    }

    // Create events
    console.log('📅 Creating events...');
    for (const event of mumbaiEvents) {
      const randomUser = mumbaiCitizens[Math.floor(Math.random() * mumbaiCitizens.length)];
      await prisma.event.create({
        data: {
          ...event,
          creator: {
            connect: { id: randomUser.id }
          },
          city: {
            connect: { id: 'mumbai' }
          }
        }
      });
    }

    // Create alerts
    console.log('🚨 Creating alerts...');
    for (const alert of mumbaiAlerts) {
      const randomAuthority = mumbaiAuthorities[Math.floor(Math.random() * mumbaiAuthorities.length)];
      await prisma.alert.create({
        data: {
          ...alert,
          creator: {
            connect: { id: randomAuthority.id }
          },
          city: {
            connect: { id: 'mumbai' }
          }
        }
      });
    }

    console.log('✅ Comprehensive seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`🏙️ Cities created: ${maharashtraCities.length}`);
    console.log(`👥 Users created: ${createdUsers.length}`);
    console.log(`📝 Reports created: ${mumbaiReports.length}`);
    console.log(`📅 Events created: ${mumbaiEvents.length}`);
    console.log(`🚨 Alerts created: ${mumbaiAlerts.length}`);
    
    console.log('\n🔑 Demo Login Credentials:');
    console.log('Citizen: rajesh.kumar@email.com / password123');
    console.log('Authority: police.mumbai@maharashtra.gov.in / password123');
    console.log('Admin: admin.mumbai@citywatch.in / password123');

  } catch (error) {
    console.error('❌ Error in comprehensive seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

comprehensiveSeed()
  .catch((error) => {
    console.error('❌ Comprehensive seed failed:', error);
    process.exit(1);
  });
