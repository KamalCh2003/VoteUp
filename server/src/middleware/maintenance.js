const prisma = require('../config/database');

const maintenanceMiddleware = async (req, res, next) => {
  if (
    req.path.startsWith('/admin') ||
    req.path === '/maintenance-status' ||
    req.path === '/api/health' ||
    req.path === '/health'
  ) {
    return next();
  }
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'maintenanceMode' },
    });
    const maintenanceMode = setting ? JSON.parse(setting.value) : false;
    if (maintenanceMode) {
      if (req.user && req.user.role === 'ADMIN') {
        return next();
      }
      return res.status(503).json({ error: 'Site is under maintenance. Please try again later.' });
    }
    next();
  } catch (err) {
    next();
  }
};

module.exports = maintenanceMiddleware;