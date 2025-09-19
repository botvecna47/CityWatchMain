#!/usr/bin/env node

/**
 * Simple test script to verify duplicate detection functionality
 * Run with: node test-duplicate-detection.js
 */

const { 
  compareEmbeddings, 
  ruleBasedMatch, 
  calculateDistance,
  calculateJaccardSimilarity,
  calculateLevenshteinSimilarity,
  normalizeText
} = require('./services/duplicateService');

console.log('🧪 Testing Duplicate Detection Service...\n');

// Test 1: Embedding comparison
console.log('1. Testing embedding comparison:');
const embedding1 = [1, 2, 3, 4, 5];
const embedding2 = [1, 2, 3, 4, 5];
const embedding3 = [0, 0, 0, 0, 0];
const embedding4 = [1, 0, 0, 0, 0];

console.log(`   Identical embeddings: ${compareEmbeddings(embedding1, embedding2)} (expected: 1)`);
console.log(`   Orthogonal embeddings: ${compareEmbeddings(embedding1, embedding3)} (expected: 0)`);
console.log(`   Similar embeddings: ${compareEmbeddings(embedding1, embedding4)} (expected: ~0.45)`);

// Test 2: Distance calculation
console.log('\n2. Testing distance calculation:');
const nyc = { lat: 40.7128, lng: -74.0060 };
const philly = { lat: 39.9526, lng: -75.1652 };
const distance = calculateDistance(nyc.lat, nyc.lng, philly.lat, philly.lng);
console.log(`   NYC to Philadelphia: ${Math.round(distance)}m (expected: ~150km)`);

// Test 3: Text normalization
console.log('\n3. Testing text normalization:');
const testText = '  Hello, World!  ';
const normalized = normalizeText(testText);
console.log(`   Original: "${testText}"`);
console.log(`   Normalized: "${normalized}"`);

// Test 4: Jaccard similarity
console.log('\n4. Testing Jaccard similarity:');
const text1 = 'broken streetlight main street';
const text2 = 'streetlight broken main street';
const text3 = 'pothole oak avenue';
const jaccard1 = calculateJaccardSimilarity(text1, text2);
const jaccard2 = calculateJaccardSimilarity(text1, text3);
console.log(`   Similar texts: ${jaccard1} (expected: high)`);
console.log(`   Different texts: ${jaccard2} (expected: low)`);

// Test 5: Levenshtein similarity
console.log('\n5. Testing Levenshtein similarity:');
const lev1 = calculateLevenshteinSimilarity('hello', 'hello');
const lev2 = calculateLevenshteinSimilarity('hello', 'helo');
const lev3 = calculateLevenshteinSimilarity('hello', 'world');
console.log(`   Identical: ${lev1} (expected: 1)`);
console.log(`   One character different: ${lev2} (expected: high)`);
console.log(`   Completely different: ${lev3} (expected: low)`);

// Test 6: Rule-based matching
console.log('\n6. Testing rule-based matching:');
const report1 = 'Broken streetlight on Main Street';
const report2 = 'Streetlight broken on Main St';
const report3 = 'Pothole on Oak Avenue';
const match1 = ruleBasedMatch(report1, report2);
const match2 = ruleBasedMatch(report1, report3);
console.log(`   Similar reports: ${match1} (expected: high)`);
console.log(`   Different reports: ${match2} (expected: low)`);

// Test 7: Configuration
console.log('\n7. Testing configuration:');
const { CONFIG } = require('./services/duplicateService');
console.log(`   Duplicate check enabled: ${CONFIG.enabled}`);
console.log(`   Geo radius: ${CONFIG.geoRadiusMeters}m`);
console.log(`   Time window: ${CONFIG.timeWindowMinutes} minutes`);
console.log(`   Embedding threshold: ${CONFIG.embeddingThreshold}`);

console.log('\n✅ All tests completed!');
console.log('\n📝 To test with real data:');
console.log('   1. Set DUPLICATE_CHECK_ENABLED=true in .env');
console.log('   2. Optionally set OLLAMA_URL or OPENAI_API_KEY');
console.log('   3. Run the server and create test reports');
console.log('   4. Try creating similar reports to see duplicate detection in action');
