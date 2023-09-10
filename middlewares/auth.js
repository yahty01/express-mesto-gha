const jwt = require('jsonwebtoken');

const UnauthError = require('../errors/unauth-err');

module.exports = (req, res, next) => {
  const { jwtMesto = null } = req.cookies;

  if (!jwtMesto) {
    return next(new UnauthError('Вы не авторизованы. Авторизуйтесь', 'Auth error', 'access denied'));
  }

  let payload;

  try {
    payload = jwt.verify(jwtMesto, 'some-secret-key');
  } catch (err) {
    return next(new UnauthError('Ошибка авторизации. Авторизуйтесь', 'Auth error', 'access denied'));
  }

  req.user = payload;
  next();
  return null;
};
