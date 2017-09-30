#!env node

var in_data = require('./bills.json');
var out_data = {
	types: [],
	items: [],
};

var convert_type = function(o) {
	o.id = parseInt(o.id) + 1;
	o.repeat_type = parseInt(o.repeat_type);
	return o;
}

var convert_item = function(o) {
	o.id = parseInt(o.id);
	o.type_id = parseInt(o.type_id) + 1;
	o.automatic = parseInt(o.automatic);
	return o;
}

in_data.forEach(function (o) {
	if (o.type == "table") {
		if (o.name == "bills_item_types") {
			out_data.types = o.data.map(convert_type);
		} else if (o.name == "bills_item_instances") {
			out_data.items = o.data.map(convert_item);
		}
	}
});

console.log(JSON.stringify(out_data, null, '  '));