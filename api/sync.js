#!env node
import db from './models';

db.sync({force: false}).then(() => {
	console.log("Synchronized");
}).finally(() => {
	process.exit();
});