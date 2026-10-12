function transform(input) {
	var results = [];
	new global.GlideQuery('alm_stockroom')
	.select('name', 'sys_id', 'location$DISPLAY')
	.forEach(function(stockroom) {
		var data = {};
		data['id'] = stockroom.sys_id;
		data['label'] = stockroom.name;
		data['sublabel'] = stockroom.location$DISPLAY;
		results.push(data);
	});
	return results;
}
