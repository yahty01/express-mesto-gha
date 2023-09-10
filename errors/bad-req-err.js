const {
  HTTP_STATUS_BAD_REQUEST,
} = require('http2').constants;

class BadReqError extends Error {
  constructor(message, errName, errMessage) {
    super(`${message} Ошибка: ${errName}. Сообщение ошибки: ${errMessage}`);
    this.statusCode = HTTP_STATUS_BAD_REQUEST;
  }
}

module.exports = BadReqError;
