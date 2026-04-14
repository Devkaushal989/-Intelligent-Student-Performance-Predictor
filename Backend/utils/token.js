const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'dev_secret_change_me', {
    expiresIn: '7d',
  });
};

module.exports = { generateToken };
