const {
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
} = require('http2').constants;

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');

const router = require('./routes/index');

const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(DB_URL, {});
// .then(() => {
// drop users collection from previouse project
// mongoose.connection.db.dropCollection('users');
// }).then(() => { console.log('all right'); })
//   .catch((err) => { console.log(err); });

app.use(cookieParser());

app.use('/', router);

app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = HTTP_STATUS_INTERNAL_SERVER_ERROR, message } = err;
  res.status(statusCode).send({
    message: statusCode === 500
      ? `На сервере произошла ошибка. ${err.message}`
      : message,
  });
  next();
});

app.listen(PORT, () => {});
