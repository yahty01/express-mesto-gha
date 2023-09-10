const {
  HTTP_STATUS_NOT_FOUND,
} = require('http2').constants;

class NotFoundError extends Error {
  constructor(message, errName, errMessage) {
    super(`${message} Ошибка: ${errName}. Сообщение ошибки: ${errMessage}`);
    this.statusCode = HTTP_STATUS_NOT_FOUND;
  }
}

module.exports = NotFoundError;
