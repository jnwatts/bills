#!env node
import db from './models';

var data = require(process.argv[2]);

console.log("Init DB...");
db.sync({force: true}).then(() => {
	console.log("Importing types...");
	return db.type.bulkCreate(data.types).then(() => {
		console.log("Importing items...");
		return db.item.bulkCreate(data.items);
	});
}).finally(() => {
	console.log("Done.");
	process.exit();
});