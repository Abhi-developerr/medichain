const { cache } = require('../config/redis');

// Cache middleware for GET requests
const cacheMiddleware = (duration = 3600) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key from URL and user ID
    const userId = req.user?._id || 'anonymous';
    const cacheKey = `cache:${userId}:${req.originalUrl}`;

    try {
      // Check cache
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        console.log(`✅ Cache HIT: ${cacheKey}`);
        return res.json(cachedData);
      }

      console.log(`❌ Cache MISS: ${cacheKey}`);

      // Store original res.json function
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = (data) => {
        // Cache successful responses only
        if (res.statusCode === 200) {
          cache.set(cacheKey, data, duration).catch(err => {
            console.error('Cache set error:', err);
          });
        }
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Clear cache for specific user
const clearUserCache = async (userId) => {
  try {
    await cache.delPattern(`cache:${userId}:*`);
    console.log(`🗑️  Cleared cache for user: ${userId}`);
  } catch (error) {
    console.error('Clear user cache error:', error);
  }
};

// Clear cache for specific route pattern
const clearRouteCache = async (pattern) => {
  try {
    await cache.delPattern(`cache:*:${pattern}*`);
    console.log(`🗑️  Cleared cache for route: ${pattern}`);
  } catch (error) {
    console.error('Clear route cache error:', error);
  }
};

module.exports = {
  cacheMiddleware,
  clearUserCache,
  clearRouteCache
};
