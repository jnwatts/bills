#!env node
const express = require('express');
const bodyParser = require('body-parser');
// const api = require('./api');
import api from './api';

const app = express();

const init = () => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use('/bills/api', api);
  const server = app.listen(8080);
  api.setup(server);
  console.log('Running...\n');
};

init();
