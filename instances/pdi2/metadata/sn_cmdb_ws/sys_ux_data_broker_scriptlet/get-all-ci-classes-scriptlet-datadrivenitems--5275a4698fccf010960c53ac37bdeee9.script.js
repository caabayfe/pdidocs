function transform(input) {
	return input.items.items.map(function(o) {
		return {
			id: o.id,
			label: o.label,
			sublabel: o.id
		};
	});
	
}
