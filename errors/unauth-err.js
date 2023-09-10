const {
  HTTP_STATUS_UNAUTHORIZED,
} = require('http2').constants;

class UnauthError extends Error {
  constructor(message, errName, errMessage) {
    super(`${message} Ошибка: ${errName}. Сообщение ошибки: ${errMessage}`);
    this.statusCode = HTTP_STATUS_UNAUTHORIZED;
  }
}

module.exports = UnauthError;
