function transform(input) {
	var items = input.items.map(function(o) {
		return {
			id: o.tableName,
			label: o.tableLabel,
			sublabel: o.tableName
		};
	});
	
	return items;
}
