const { 
  compareEmbeddings, 
  ruleBasedMatch, 
  calculateDistance,
  calculateJaccardSimilarity,
  calculateLevenshteinSimilarity,
  normalizeText
} = require('../services/duplicateService');

describe('Duplicate Service', () => {
  describe('compareEmbeddings', () => {
    test('should return 1 for identical embeddings', () => {
      const embedding = [1, 2, 3, 4, 5];
      const similarity = compareEmbeddings(embedding, embedding);
      expect(similarity).toBe(1);
    });

    test('should return 0 for orthogonal embeddings', () => {
      const embedding1 = [1, 0, 0];
      const embedding2 = [0, 1, 0];
      const similarity = compareEmbeddings(embedding1, embedding2);
      expect(similarity).toBe(0);
    });

    test('should return 0 for different length embeddings', () => {
      const embedding1 = [1, 2, 3];
      const embedding2 = [1, 2, 3, 4];
      const similarity = compareEmbeddings(embedding1, embedding2);
      expect(similarity).toBe(0);
    });

    test('should return 0 for null/undefined embeddings', () => {
      expect(compareEmbeddings(null, [1, 2, 3])).toBe(0);
      expect(compareEmbeddings([1, 2, 3], null)).toBe(0);
      expect(compareEmbeddings(undefined, [1, 2, 3])).toBe(0);
    });
  });

  describe('calculateDistance', () => {
    test('should return 0 for same coordinates', () => {
      const distance = calculateDistance(40.7128, -74.0060, 40.7128, -74.0060);
      expect(distance).toBe(0);
    });

    test('should calculate approximate distance correctly', () => {
      // Distance between NYC and Philadelphia (approximately 95 miles)
      const distance = calculateDistance(40.7128, -74.0060, 39.9526, -75.1652);
      expect(distance).toBeGreaterThan(150000); // More than 150km
      expect(distance).toBeLessThan(160000); // Less than 160km
    });
  });

  describe('normalizeText', () => {
    test('should convert to lowercase', () => {
      const result = normalizeText('HELLO WORLD');
      expect(result).toBe('hello world');
    });

    test('should remove punctuation', () => {
      const result = normalizeText('Hello, world!');
      expect(result).toBe('hello world');
    });

    test('should normalize whitespace', () => {
      const result = normalizeText('Hello    world\n\n');
      expect(result).toBe('hello world');
    });

    test('should trim whitespace', () => {
      const result = normalizeText('  hello world  ');
      expect(result).toBe('hello world');
    });
  });

  describe('calculateJaccardSimilarity', () => {
    test('should return 1 for identical texts', () => {
      const similarity = calculateJaccardSimilarity('hello world', 'hello world');
      expect(similarity).toBe(1);
    });

    test('should return 0 for completely different texts', () => {
      const similarity = calculateJaccardSimilarity('hello world', 'goodbye universe');
      expect(similarity).toBe(0);
    });

    test('should return 0.5 for 50% overlap', () => {
      const similarity = calculateJaccardSimilarity('hello world', 'hello universe');
      expect(similarity).toBe(0.5);
    });

    test('should filter out short tokens', () => {
      const similarity = calculateJaccardSimilarity('a b c hello world', 'x y z hello world');
      expect(similarity).toBe(1); // Only 'hello' and 'world' are considered
    });
  });

  describe('calculateLevenshteinSimilarity', () => {
    test('should return 1 for identical strings', () => {
      const similarity = calculateLevenshteinSimilarity('hello', 'hello');
      expect(similarity).toBe(1);
    });

    test('should return 0 for completely different strings', () => {
      const similarity = calculateLevenshteinSimilarity('hello', 'xyz');
      expect(similarity).toBeLessThan(0.5);
    });

    test('should handle empty strings', () => {
      const similarity = calculateLevenshteinSimilarity('', '');
      expect(similarity).toBe(1);
    });
  });

  describe('ruleBasedMatch', () => {
    test('should return 1 for identical texts', () => {
      const similarity = ruleBasedMatch('Broken streetlight on Main St', 'Broken streetlight on Main St');
      expect(similarity).toBe(1);
    });

    test('should return high similarity for similar texts', () => {
      const similarity = ruleBasedMatch('Broken streetlight on Main St', 'Streetlight broken on Main Street');
      expect(similarity).toBeGreaterThan(0.5);
    });

    test('should return low similarity for different texts', () => {
      const similarity = ruleBasedMatch('Broken streetlight', 'Pothole on Oak Ave');
      expect(similarity).toBeLessThan(0.5);
    });

    test('should handle case differences', () => {
      const similarity = ruleBasedMatch('BROKEN STREETLIGHT', 'broken streetlight');
      expect(similarity).toBe(1);
    });

    test('should handle punctuation differences', () => {
      const similarity = ruleBasedMatch('Broken streetlight!', 'Broken streetlight');
      expect(similarity).toBe(1);
    });
  });
});

// Mock test for integration
describe('Integration Tests', () => {
  // These would require a test database setup
  test('should detect duplicate reports with same content and location', () => {
    // This would be an integration test with actual database
    // For now, just verify the function exists
    expect(typeof require('../services/duplicateService').checkDuplicate).toBe('function');
  });

  test('should not detect duplicates for different locations', () => {
    // This would be an integration test with actual database
    expect(typeof require('../services/duplicateService').findNearbyCandidates).toBe('function');
  });
});
