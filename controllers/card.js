const Card = require('../models/card');

const OK = 200;
const CREATED = 201;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const ERROR_CODE = 500;

// Обработка GET-запроса для получения всех карточек
module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch((error) => {
      console.log(error);
      return res.status(ERROR_CODE).send({ message: 'На сервере произошла ошибка' });
    });
};

// Обработка POST-запроса для создания карточки
exports.createCard = (req, res) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(CREATED).send({ data: card }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return res.status(BAD_REQUEST).send({
          message: `Переданы некорректные данные для создании карточки - ${error.message}`,
        });
      }
      return res.status(ERROR_CODE).send({ message: error.message });
    });
};

// Обработка DELETE-запроса для удаления карточки по идентификатору
exports.deleteCard = (req, res) => {
  const { cardId } = req.params;

  Card.findByIdAndRemove(cardId)
    .orFail()
    .then(() => res.status(CREATED).send({ message: 'Карточка удалена' }))
    .catch((error) => {
      console.log(error);
      if (error.name === 'CastError') {
        return res.status(BAD_REQUEST).send({ message: 'Карточка с указанным _id не найдена' });
      }
      return res.status(ERROR_CODE).send({ message: 'На сервере произошла ошибка' });
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      res.status(NOT_FOUND);
      throw Error;
    })
    .then((card) => res.status(CREATED).send({ data: card }))
    .catch((error) => {
      if (error.name === 'CastError') {
        return res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные для постановки лайка' });
      }
      return res.status(ERROR_CODE).send({ message: 'На сервере произошла ошибка' });
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .orFail(() => {
      res.status(NOT_FOUND);
      throw Error;
    })
    .then((card) => res.status(OK).send({ data: card }))
    .catch((error) => {
      if (error.name === 'CastError') {
        return res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные для постановки лайка' });
      }
      return res.status(ERROR_CODE).send({ message: 'На сервере произошла ошибка' });
    });

};
