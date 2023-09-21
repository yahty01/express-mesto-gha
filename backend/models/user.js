const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const UnauthorizedErrorError = require('../errors/UnauthorizedError');
const { urlRegex, emailRegex } = require('../utils/constants');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Жак-Ив Кусто',
    minlength: [2, 'Минимальное количество символов 2'],
    maxlength: [30, 'Максимальное количество символов 30'],
  },
  about: {
    type: String,
    default: 'Исследователь',
    minlength: [2, 'Минимальное количество символов 2'],
    maxlength: [30, 'Максимальное количество символов 30'],
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator(url) {
        return urlRegex.test(url);
      },
      message: 'Некорректный URL',
    },
  },
  email: {
    type: String,
    required: [true, 'Обязательное поле'],
    unique: true, // уникальное значение
    validate: {
      validator(email) {
        return emailRegex.test(email);
      },
      message: 'Некорректный email',
    },
  },
  password: {
    type: String,
    required: [true, 'Обязательное поле'],
    minlength: [3, 'Минимальное количество символов 3'],
    select: false,
  },
}, { versionKey: false });

userSchema.statics.findUserByCredentials = function findUserByCredentials(email, password) {
  return this.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedErrorError('Неправильные почта или пароль');
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new UnauthorizedErrorError('Неправильные почта или пароль');
          }
          return user;
        });
    });
};

// создаём модель и экспортируем её
module.exports = mongoose.model('user', userSchema);
