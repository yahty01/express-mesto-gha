const mongoose = require('mongoose');
const validatorLib = require('validator');
const bcrypt = require('bcryptjs');

const UnauthError = require('../errors/unauth-err');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Жак-Ив Кусто',
    minlength: [2, 'Минимальная длина поля "name" - 2'],
    maxlength: [30, 'Максимальная длина поля "name" - 30'],
  },
  about: {
    type: String,
    default: 'Исследователь',
    minlength: [2, 'Минимальная длина поля "name" - 2'],
    maxlength: [30, 'Максимальная длина поля "name" - 30'],
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator(v) {
        const urlRegex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=[\]]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=[\]]*)$/;
        return urlRegex.test(v);
      },
      message: (props) => `${props.value}  - не верный формат ссылки!`,
    },
  },
  email: {
    type: String,
    required: [true, 'Поле "email" должно быть заполнено'],
    unique: true,
    validate: {
      validator(v) {
        return validatorLib.isEmail(v);
      },
      message: 'Введенное значение почты не является корректным электронным адресом',
    },

  },
  password: {
    type: String,
    required: [true, 'Поле "password" должно быть заполнено'],
    select: false,
  },
}, { versionKey: false });

// eslint-disable-next-line func-names
userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new UnauthError('Ошибка авторизации. Проверьте почту и пароль', 'Auth error', 'Wrong auth data'));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new UnauthError('Ошибка авторизации. Проверьте почту и пароль', 'Auth error', 'Wrong auth data'));
          }
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
