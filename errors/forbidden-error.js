const {
  HTTP_STATUS_FORBIDDEN,
} = require('http2').constants;

class ForbiddenError extends Error {
  constructor(message, errName, errMessage) {
    super(`${message} Ошибка: ${errName}. Сообщение ошибки: ${errMessage}`);
    this.statusCode = HTTP_STATUS_FORBIDDEN;
  }
}

module.exports = ForbiddenError;
