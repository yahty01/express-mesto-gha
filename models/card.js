const mongoose = require('mongoose');

// const likeSchema = new mongoose.Schema({
//   like: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user',
//   },
// });

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Поле "name" должно быть заполнено'],
    minlength: [2, 'Минимальная длина поля "name" - 2'],
    maxlength: [30, 'Максимальная длина поля "name" - 30'],
  },
  link: {
    type: String,
    required: [true, 'Поле "link" должно быть заполнено'],
    validate: {
      validator(v) {
        const urlRegex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=[\]]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=[\]]*)$/;
        return urlRegex.test(v);
      },
      message: (props) => `${props.value}  - не верный формат ссылки!`,
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'Поле "owner" должно быть заполнено'],
  },
  likes: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
    ],
    default: [],
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
}, { versionKey: false });

module.exports = mongoose.model('card', cardSchema);
