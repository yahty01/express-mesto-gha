const User = require('../models/user'); // Обработка GET-запроса для получения всех пользователей

const CREATED = 201;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const ERROR_CODE = 500;

exports.getUsers = (req, res) => {
  User.find()
    .then((users) => {
      res.send(users);
    })
    .catch((error) => {
      res
        .status(ERROR_CODE)
        .send({ message: `Ошибка по умолчанию -  ${error.message}` });
    });
};

// Обработка GET-запроса для получения пользователя по ID
exports.getUserById = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail()
    .then((user) => res.send({ data: user }))
    .catch((error) => {
      if (error.name === 'CastError') {
        return res.status(BAD_REQUEST).send({ message: `Переданы некорректные данные -  ${error.message}` });
      }
      if (error.name === 'DocumentNotFoundError') {
        return res
          .status(NOT_FOUND)
          .send({ message: 'Пользователь по указанному id не найден.' });
      }
      return res.status(ERROR_CODE).send({ message: error.message });
    });
};

// Обработка POST-запроса для создания пользователя
module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.status(CREATED).send({ data: user }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return res.status(BAD_REQUEST).send({
          message: `Переданы некорректные данные при создании пользователя. ${error.message}`,
        });
      }
      return res.status(ERROR_CODE).send({ message: error.message });
    });
};

// Обработка PUT-запроса для обновления информации о пользователе
module.exports.updateUserInfo = (req, res) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
      new: true,
      runValidators: true,
      upsert: false,
    },
  )
    .orFail(new Error('NotFound'))
    .then((user) => res.send({ data: user }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        res.status(BAD_REQUEST).send({
          message: 'Переданы невалидные данные для обновления данных юзера',
        });
      } else if (error.name === 'CastError') {
        res.status(BAD_REQUEST).send({ message: 'Передан невалидный id юзера' });
      } else {
        res
          .status(ERROR_CODE)
          .send({ message: `Ошибка по умолчанию -  ${error.message}` });
      }
    });
};

// Обработка PUT-запроса для обновления аватара пользователя
module.exports.updateUserAvatar = (req, res) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true,

      runValidators: true,
      upsert: false,
    },
  )
    .orFail(new Error('NotFound'))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST).send({
          message: 'Отправлены невалидные данные для обновления аватара',
        });
      } else if (err.name === 'CastError') {
        res.status(BAD_REQUEST).send({ message: 'Отправлен невалидный id юзера' });
      } else {
        res
          .status(ERROR_CODE)
          .send({ message: `Ошибка по умолчанию -  ${error.message}` });
      }
    });
};
