const feathers = require('feathers');
const rest = require('feathers-rest');
const service = require('feathers-sequelize');
const hooks = require('feathers-hooks');

import db from './models';
const api = feathers();

api.configure(rest());
api.configure(hooks());


const item_service = service({
	Model: db.item,
	id: 'id',
});
api.use('/item', item_service);

api.service('/item').hooks({
	before: {
		find: [
			hook => {
				var date = hook.params.query.date;
				if (date) {
					var m = date.match(/([0-9]{4})-([0-9]{1,2})/);
					if (m) {
						var year = m[1];
						var month = m[2];
						var last_day = new Date(
							parseInt(year),
							parseInt(month) + 1,
							0).getDate().toString();
						hook.params.query = {
							due_date: {
								$between: [year + '-' + month + '-1', year + '-' + month + '-' + last_day],
							},
						};
					}
				}
			},
		],
	}
})

api.use('/type', service({
	Model: db.type,
	id: 'id',
}));

export default api;