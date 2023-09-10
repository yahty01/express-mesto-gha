const {
  HTTP_STATUS_OK,
  HTTP_STATUS_CREATED,
} = require('http2').constants;

const mongoose = require('mongoose');

const Card = require('../models/card');

const BadReqError = require('../errors/bad-req-err');
const NotFoundError = require('../errors/not-found-err');
const ForbiddenError = require('../errors/forbidden-error');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((card) => res.status(HTTP_STATUS_OK).send({ data: card }))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.status(HTTP_STATUS_CREATED).send({ data: card }))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadReqError('Переданы некорректные данные.', err.name, err.message));
      }
      return next(err);
    });
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail()
    .then((card) => {
      if (String(card.owner) !== req.user._id) {
        return next(new ForbiddenError('Вы не можете удалять карточки других пользвателей.', 'ForbiddenError', 'Доступ запрещен'));
      }

      return Card.deleteOne({ _id: req.params.cardId })
        .then((resObj) => ({ resObj, card }))
        .catch(next);
    })
    .then(({ resObj, card }) => {
      if (!resObj.deletedCount) return Promise.reject(new Error('Bad delete'));
      res.status(HTTP_STATUS_OK).send({ data: card });
      return null;
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.DocumentNotFoundError) {
        return next(new NotFoundError('Карточки с переданным _id не существует.', err.name, err.message));
      }
      if (err instanceof mongoose.Error.CastError) {
        return next(new BadReqError('Некорректный формат _id.', err.name, err.message));
      }
      return next(err);
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true, runValidators: true },
  )
    .orFail()
    .then((card) => {
      res.status(HTTP_STATUS_OK).send({ data: card });
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.DocumentNotFoundError) {
        return next(new NotFoundError('Карточки с переданным _id не существует.', err.name, err.message));
      }
      if (err instanceof mongoose.Error.CastError) {
        return next(new BadReqError('Некорректный формат _id.', err.name, err.message));
      }
      return next(err);
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true, runValidators: true },
  )
    .orFail()
    .then((card) => res.status(HTTP_STATUS_OK).send({ data: card }))
    .catch((err) => {
      if (err instanceof mongoose.Error.DocumentNotFoundError) {
        return next(new NotFoundError('Карточки с переданным _id не существует.', err.name, err.message));
      }
      if (err instanceof mongoose.Error.CastError) {
        return next(new BadReqError('Некорректный формат _id.', err.name, err.message));
      }
      return next(err);
    });
};
