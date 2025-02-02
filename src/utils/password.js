const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
};

const comparePasswords = async (plainPassword, hashedPassword) => {
  if (!plainPassword || !hashedPassword) {
    throw new Error('Missing password or hash for comparison');
  }
  
  if (typeof plainPassword !== 'string' || typeof hashedPassword !== 'string') {
    throw new Error('Password and hash must both be strings');
  }

  return bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePasswords
};
