function transform(input) {
	var items = input.items.result.map(function(o) {
		return {
			id: o.ci_type,
			label: o.ci_type_label,
			sublabel: o.ci_type
		};
	});
	
	return items;
}
