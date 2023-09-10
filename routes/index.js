const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const usersRouter = require('./users');
const cardsRouter = require('./cards');
const NotFoundError = require('../errors/not-found-err');

const auth = require('../middlewares/auth');

const {
  createUser, login,
} = require('../controllers/users');

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

router.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(/^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=[\]]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=[\]]*)$/),
  }),
}), createUser);

router.use(auth);

router.get('/signout', (req, res) => {
  res.clearCookie('jwtMesto').send({ message: 'Выход' });
});

router.use('/', usersRouter);
router.use('/', cardsRouter);

router.use('*', (req, res, next) => {
  next(new NotFoundError(`Путь ${`${req.protocol}://${req.get('host')}${req.originalUrl}`} не существует`, 'Not founded', 'Не найден url'));
});

module.exports = router;
