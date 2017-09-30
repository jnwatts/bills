const path = require('path');
const sequelize = require('sequelize');
import Type from './type';
import Item from './item';

var config;
try {
	config = require('../../config.json');
} catch (err) {
	console.log(err);
	process.exit();
}
const db = new sequelize(config.db.database, config.db.username, config.db.password, {
	dialect: 'mysql',
	logging: false,
});

db.type = db.define('type', Type, {underscored: true});
db.item = db.define('item', Item, {underscored: true});
db.item.belongsTo(db.type, {allowNull: true});

export default db;