const router = require('express').Router();

const { celebrate, Joi } = require('celebrate');

const {
  getUsers, findUser, updateUserInfo, updateUserAvatar, getCurrentUserInfo,
} = require('../controllers/users');

router.get('/users', getUsers);
router.get('/users/me', getCurrentUserInfo);

router.get('/users/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().length(24).hex().required(),
  }),
}), findUser);

router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), updateUserInfo);

router.patch('/users/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().pattern(/^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=[\]]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=[\]]*)$/),
  }),
}), updateUserAvatar);

module.exports = router;
