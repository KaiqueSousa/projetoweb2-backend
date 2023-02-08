const { Sequelize } = require('sequelize');
const dotenv = require('dotenv').config();

const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME } = process.env;

const url = `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:5432/${DB_NAME}`;
const sequelize = new Sequelize(url);
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.contato = require('../models/contato')(sequelize, Sequelize);
db.user = require('../models/user')(sequelize, Sequelize);
db.admin = require('../models/admin')(sequelize,Sequelize);

db.sync = async() => {
  await sequelize.sync();
};

module.exports = db;
