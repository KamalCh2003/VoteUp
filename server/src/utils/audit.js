// utils/audit.js
const prisma = require('../config/database');

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = forwarded.split(',').map(ip => ip.trim());
    return ips[0]; 
  }
  return req.ip || 'unknown';
}

async function createAuditLog({ userId, event, details, ipAddress, result = 'OK' }) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        event,
        details,
        ipAddress,
        result,
      },
    });
  } catch (err) {
    console.error('Failed to create audit log:', err);
  }
}

module.exports = { createAuditLog, getClientIp };