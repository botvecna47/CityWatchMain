// Simple in-memory cache for API responses
class CacheService {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 30 * 1000; // 30 seconds
    this.maxSize = 1000; // Maximum number of cache entries
    this.accessOrder = new Map(); // Track access order for LRU
  }

  // Generate cache key from request parameters
  generateKey(route, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});

    return `${route}:${JSON.stringify(sortedParams)}`;
  }

  // Get cached value
  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      return null;
    }

    // Update access order for LRU
    this.accessOrder.set(key, Date.now());
    return item.value;
  }

  // Set cached value
  set(key, value, ttl = this.defaultTTL) {
    // Check if we need to evict entries
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { value, expiresAt });
    this.accessOrder.set(key, Date.now());
  }

  // Evict least recently used entry
  evictLRU() {
    if (this.cache.size === 0) {
      return;
    }

    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, time] of this.accessOrder.entries()) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.accessOrder.delete(oldestKey);
    }
  }

  // Delete cached value
  delete(key) {
    this.cache.delete(key);
    this.accessOrder.delete(key);
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    this.accessOrder.clear();
  }

  // Clean expired entries
  cleanExpired() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
        this.accessOrder.delete(key);
      }
    }
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
      memoryUsage: this.cache.size * 1024 // Rough estimate in bytes
    };
  }
}

// Create singleton instance
const cacheService = new CacheService();

// Clean expired entries every 5 minutes
setInterval(
  () => {
    cacheService.cleanExpired();
  },
  5 * 60 * 1000
);

module.exports = cacheService;
