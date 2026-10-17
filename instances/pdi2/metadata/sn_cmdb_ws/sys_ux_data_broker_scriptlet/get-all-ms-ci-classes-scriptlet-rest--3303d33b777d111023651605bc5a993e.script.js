function transform(input) {
	var items = input.items.result.map(function(o) {
		return {
			id: o.value,
			label: o.name,
			sublabel: o.value
		};
	});
	
	return items;
}
