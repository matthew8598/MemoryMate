// utils/errorHandler.js

/**
 * Formats error responses consistently.
 * @param {string} message - The error message.
 * @param {number} [statusCode=500] - The HTTP status code.
 * @returns {object} - Formatted error response.
 */
function formatError(message, statusCode = 500) {
  return {
    error: {
      message,
      statusCode,
    },
  };
}

module.exports = {
  formatError,
};
