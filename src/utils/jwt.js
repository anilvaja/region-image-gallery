const jwt = require('jsonwebtoken');

const generateToken = (userId, regionId) => {
  const payload = {
    user_id: userId,
    region_id: regionId,
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'your_secret', {
    expiresIn: process.env.JWT_EXPIRY || '7d',
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your_secret');
  } catch (error) {
    return null;
  }
};

const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
};
