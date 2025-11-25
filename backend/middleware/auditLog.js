const AuditLog = require('../models/AuditLog');

// Middleware to create audit log
exports.createAuditLog = (action, resource) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json method
    res.json = async function(data) {
      try {
        // Only log if request was successful
        if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
          const logData = {
            user: req.user._id,
            action,
            resource,
            resourceId: req.params.id || req.body._id || data?.data?._id,
            details: {
              method: req.method,
              path: req.path,
              body: sanitizeBody(req.body),
              params: req.params,
              query: req.query
            },
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent')
          };
          
          await AuditLog.create(logData);
        }
      } catch (error) {
        console.error('Audit log error:', error);
        // Don't fail the request if audit logging fails
      }
      
      // Call original json method
      return originalJson(data);
    };
    
    next();
  };
};

// Sanitize sensitive data from body
function sanitizeBody(body) {
  if (!body) return {};
  
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'twoFactorSecret', 'resetPasswordToken'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}
