const crypto = require('crypto');

/**
 * Computes the SHA-256 hex digest of a binary file buffer.
 * @param {Buffer} buffer - File buffer
 * @returns {string} - Hex string digest
 */
const calculateSHA256 = (buffer) => {
    return crypto.createHash('sha256').update(buffer).digest('hex');
};

module.exports = { calculateSHA256 };
