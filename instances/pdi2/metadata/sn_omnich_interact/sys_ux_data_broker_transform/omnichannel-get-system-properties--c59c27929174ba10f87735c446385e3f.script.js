function transform(input) {
    var result = {
		properties: {}
	};
	if (input.properties && input.properties.length > 0) {
		var properties = input.properties.trim().split(',');
		properties.forEach(function(name) {
			result.properties[name] = gs.getProperty(name);
		});
	}
	return result;
}
