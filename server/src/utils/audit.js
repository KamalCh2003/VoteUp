const prisma = require("../config/database");

async function createAuditLog({ userId, event, details, ipAddress, result = "OK" }) {
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
    console.error("Failed to create audit log:", err);
  }
}

module.exports = { createAuditLog };