function transform(input) {
	var properties = input.properties.trim().split(',');
	var result = {
		properties: {},
		errors: []
	};
	try {
		if (!properties || !properties.length) {
			result.errors.push('the properties param is missing');
		} else {
			properties.forEach(function(name) {
				result.properties[name] = gs.getProperty(name);
			});
		}
	} catch (error) {
		result.errors.push(error.toString());
	}
	return result;
}
