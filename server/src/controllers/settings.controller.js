const prisma = require('../config/database');
const { createAuditLog } = require('../utils/audit');

exports.getSettings = async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany();
    res.json({ settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load settings' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    const operations = Object.entries(settings).map(([key, value]) =>
      prisma.systemSetting.upsert({
        where: { key },
        update: { value: JSON.stringify(value) },
        create: { key, value: JSON.stringify(value) },
      })
    );
    await prisma.$transaction(operations);
    await createAuditLog({
      userId: req.user.id,
      event: 'SETTINGS_UPDATED',
      details: 'Updated system settings',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      result: 'OK',
    });
    res.json({ message: 'Settings updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

exports.getMaintenanceStatus = async (req, res) => {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'maintenanceMode' },
    });
    const maintenanceMode = setting ? JSON.parse(setting.value) : false;
    res.json({ maintenanceMode });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch maintenance status' });
  }
};