const mongoose = require('mongoose');
const { urlRegex } = require('../utils/constants');

// описываем схему
const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Обязательное поле'],
    minlength: [2, 'Минимальное количество символов 2'],
    maxlength: [30, 'Максимальное количество символов 30'],
  },
  link: {
    type: String,
    required: [true, 'Обязательное поле'],
    validate: {
      validator(url) {
        return urlRegex.test(url);
      },
      message: 'Некорректный URL',
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    default: [],
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { versionKey: false });

// создаём модель и экспортируем её
module.exports = mongoose.model('card', cardSchema);
