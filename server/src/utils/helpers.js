const { v4: uuidv4 } = require('uuid');

const generateTxHash = () => {
  return '0x' + uuidv4().replace(/-/g, '');
};

const sanitizeOutput = (user) => {
  const { passwordHash, ...rest } = user;
  return rest;
};

module.exports = { generateTxHash, sanitizeOutput };