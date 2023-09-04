const Card = require('../models/card');
const {
  GENERAL_ERROR,
  RESOURCE_NOT_FOUND,
  BAD_REQUEST,
  STATUS_OK_CREATED,
  STATUS_OK,
} = require('../utils/constants');

// Обработка GET-запроса для получения всех карточек
module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch((error) => {
      console.log(error);
      return res.status(GENERAL_ERROR).send({ message: error.message });
    });
};

// Обработка POST-запроса для создания карточки
exports.createCard = (req, res) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(STATUS_OK_CREATED).send({ data: card }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return res.status(BAD_REQUEST).send({
          message: `Переданы некорректные данные для создании карточки - ${error.message}`,
        });
      }
      return res.status(GENERAL_ERROR).send({ message: error.message });
    });
};

// Обработка DELETE-запроса для удаления карточки по идентификатору
exports.deleteCard = (req, res) => {
  const { cardId } = req.params;

  Card.findByIdAndRemove(cardId)
    .orFail()
    .then(() => res.status(STATUS_OK).send({ message: 'Карточка удалена' }))
    .catch((error) => {
      console.log(error);

      if (error.name === 'CastError') {
        return res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные для удаления карточки.' });
      }
      if (error.name === 'DocumentNotFoundError') {
        return res.status(RESOURCE_NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена.' });
      }
      return res.status(GENERAL_ERROR).send({ message: error.message });
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      res.status(RESOURCE_NOT_FOUND);
      throw Error;
    })
    .then((card) => res.status(STATUS_OK).send({ data: card }))
    .catch((error) => {
      if (error.name === 'CastError') {
        res.status(BAD_REQUEST).send({ message: 'Передан невалидный id карточки' });
      } else if (res.statusCode === RESOURCE_NOT_FOUND) {
        res.send({ message: 'Запрашиваемая карточка не найдена' });
      } else {
        res.status(GENERAL_ERROR).send({ message: `${error.message}` });
      }
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .orFail(() => {
      res.status(RESOURCE_NOT_FOUND);
      throw Error;
    })
    .then((card) => res.status(STATUS_OK).send({ data: card }))
    .catch((error) => {
      if (error.name === 'CastError') {
        res.status(BAD_REQUEST).send({ message: 'Передан невалидный id карточки' });
      } else if (res.statusCode === RESOURCE_NOT_FOUND) {
        res.send({ message: 'Запрашиваемая карточка не найдена' });
      } else {
        res.status(GENERAL_ERROR).send({ message: `${error.message}` });
      }
    });
};
