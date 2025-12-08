const Redis = require('ioredis');

// Redis client configuration
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableOfflineQueue: false
});

redisClient.on('connect', () => {
  console.log('✅ Redis Connected');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Error:', err.message);
});

redisClient.on('close', () => {
  console.log('⚠️  Redis Connection Closed');
});

// Cache helper functions
const cache = {
  // Get cached data
  async get(key) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  // Set cache with expiry (default 1 hour)
  async set(key, value, expirySeconds = 3600) {
    try {
      await redisClient.setex(key, expirySeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },

  // Delete cache
  async del(key) {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  },

  // Delete multiple keys by pattern
  async delPattern(pattern) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return false;
    }
  },

  // Check if key exists
  async exists(key) {
    try {
      return await redisClient.exists(key);
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  },

  // Set expiry on existing key
  async expire(key, seconds) {
    try {
      await redisClient.expire(key, seconds);
      return true;
    } catch (error) {
      console.error('Cache expire error:', error);
      return false;
    }
  },

  // Increment counter
  async incr(key) {
    try {
      return await redisClient.incr(key);
    } catch (error) {
      console.error('Cache incr error:', error);
      return null;
    }
  },

  // Decrement counter
  async decr(key) {
    try {
      return await redisClient.decr(key);
    } catch (error) {
      console.error('Cache decr error:', error);
      return null;
    }
  },

  // Flush all cache
  async flush() {
    try {
      await redisClient.flushdb();
      return true;
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  }
};

module.exports = { redisClient, cache };
