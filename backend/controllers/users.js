const { HTTP_STATUS_CREATED, HTTP_STATUS_OK } = require('http2').constants;
const { default: mongoose } = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');

const { SECRET_KEY = 'secret-key' } = process.env;

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    })
      .then((user) => res.status(HTTP_STATUS_CREATED).send({
        name: user.name, about: user.about, avatar: user.avatar, _id: user._id, email: user.email,
      })) // status = 201
      .catch((err) => {
        if (err.code === 11000) {
          next(new ConflictError('Пользователь с данными email уже зарегистрирован'));
        } else if (err instanceof mongoose.Error.ValidationError) {
          next(new BadRequestError(err.message));
        } else {
          next(err);
        }
      }));
};

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((user) => res.status(HTTP_STATUS_OK).send(user)) // status = 200
    .catch(next);
};

module.exports.getMeUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => { res.status(HTTP_STATUS_OK).send(user); })
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail()
    .then((user) => { res.status(HTTP_STATUS_OK).send(user); }) // status = 200
    .catch((err) => {
      switch (err.constructor) {
        case mongoose.Error.CastError:
          next(new BadRequestError(`Некорректный id: ${req.params.userId}`));
          break;
        case mongoose.Error.DocumentNotFoundError:
          next(new NotFoundError(`Пользователь с данным id: ${req.params.userId} - не найден`));
          break;
        default:
          next(err);
          break;
      }
    });
};

module.exports.editUserData = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: 'true', runValidators: true }) // new - для возврата обновленных данных, runValidators - для валидации полей
    .orFail()
    .then((user) => { res.status(HTTP_STATUS_OK).send(user); }) // status = 200
    .catch((err) => {
      switch (err.constructor) {
        case mongoose.Error.DocumentNotFoundError:
          next(new NotFoundError('Пользователь с данным id - не найден'));
          break;
        case mongoose.Error.ValidationError:
          next(new BadRequestError(err.message));
          break;
        default:
          next(err);
          break;
      }
    });
};

module.exports.editUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: 'true', runValidators: true })
    .orFail()
    .then((user) => { res.status(HTTP_STATUS_OK).send(user); }) // status = 200
    .catch((err) => {
      switch (err.constructor) {
        case mongoose.Error.DocumentNotFoundError:
          next(new NotFoundError('Пользователь с данным id - не найден'));
          break;
        case mongoose.Error.ValidationError:
          next(new BadRequestError(err.message));
          break;
        default:
          next(err);
          break;
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, SECRET_KEY, { expiresIn: '7d' });
      res.status(HTTP_STATUS_OK).send({ token });
    })
    .catch((err) => {
      next(err);
    });
};
