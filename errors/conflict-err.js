const {
  HTTP_STATUS_CONFLICT,
} = require('http2').constants;

class ConflictError extends Error {
  constructor(message, errName, errMessage) {
    super(`${message} Ошибка: ${errName}. Сообщение ошибки: ${errMessage}`);
    this.statusCode = HTTP_STATUS_CONFLICT;
  }
}

module.exports = ConflictError;
