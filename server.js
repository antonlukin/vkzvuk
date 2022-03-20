const express = require('express');
const expurl = require('express-normalizeurl');
const fileUpload = require('express-fileupload');

// Require settings.
require('dotenv').config();

// Create express instance.
const server = express();

// Solve the trailing slashes problem.
server.enable('strict routing');

// Add trailing slashes
server.use(expurl());

// Hide specific Express header.
server.disable('x-powered-by');

// Enable files upload
server.use(fileUpload({
  createParentPath: true
}));

server.use(express.json());
server.use(express.urlencoded({
  extended: true
}));

// Add json answers middleware.
server.use((req, res, next) => {
  const answer = {};

  res.answer = (success = true, code = 200, result = null) => {
    answer.success = success;

    if (result) {
      answer.result = result;
    }

    return res.status(code).json(answer);
  };

  next();
});

// Require app routes.
const routes = require('./routes');
server.use('/', routes);

server.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).send('Something broke!');
});

server.listen(process.env.PORT || 3000);