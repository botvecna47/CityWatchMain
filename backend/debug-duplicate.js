#!/usr/bin/env node

/**
 * Debug script to test duplicate detection with real database data
 */

const { checkDuplicate } = require('./services/duplicateService');
const prisma = require('./services/database');

async function testDuplicateDetection() {
  console.log('🔍 Testing duplicate detection with real data...\n');

  try {
    // Get some recent reports from the database
    const recentReports = await prisma.report.findMany({
      where: {
        deleted: false,
        latitude: { not: null },
        longitude: { not: null }
      },
      select: {
        id: true,
        title: true,
        description: true,
        latitude: true,
        longitude: true,
        cityId: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    console.log(`📊 Found ${recentReports.length} recent reports:`);
    recentReports.forEach((report, index) => {
      console.log(`${index + 1}. "${report.title}" - ${report.cityId} - ${report.createdAt.toISOString()}`);
    });

    if (recentReports.length === 0) {
      console.log('❌ No reports found in database');
      return;
    }

    // Test duplicate detection with the first report
    const testReport = recentReports[0];
    console.log(`\n🧪 Testing duplicate detection for: "${testReport.title}"`);
    
    const result = await checkDuplicate({
      title: testReport.title,
      description: testReport.description,
      latitude: testReport.latitude,
      longitude: testReport.longitude,
      cityId: testReport.cityId
    });

    console.log('\n📋 Duplicate detection result:');
    console.log(`   Duplicate found: ${result.duplicate}`);
    console.log(`   Matches: ${result.matches.length}`);
    
    if (result.matches.length > 0) {
      result.matches.forEach((match, index) => {
        console.log(`   ${index + 1}. "${match.title}" - ${Math.round(match.similarity * 100)}% similar`);
      });
    }

    // Test with a slightly modified version
    console.log('\n🧪 Testing with modified title...');
    const modifiedResult = await checkDuplicate({
      title: testReport.title + ' (modified)',
      description: testReport.description,
      latitude: testReport.latitude,
      longitude: testReport.longitude,
      cityId: testReport.cityId
    });

    console.log(`   Duplicate found: ${modifiedResult.duplicate}`);
    console.log(`   Matches: ${modifiedResult.matches.length}`);

  } catch (error) {
    console.error('❌ Error testing duplicate detection:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Set environment variable and run test
process.env.DUPLICATE_CHECK_ENABLED = 'true';
testDuplicateDetection();
