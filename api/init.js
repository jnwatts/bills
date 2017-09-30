#!env node
import db from './models';

db.sync({force: true}).then(() => {
	console.log("Synchronized");
	return db.type.create({name: 'MISC'}).then(task => {
		console.log('Created MISC type');
	});
}).finally(() => {
	process.exit();
});
