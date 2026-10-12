(function executeRule(current, previous /* null when async */) {
	function isValidJSON(str) {
		try {
			JSON.parse(str);
			return true;
		} catch (e) {
			return false;
		}
	}

	var jsonFields = [
		{ name: 'body', label: 'Body' },
		{ name: 'headers', label: 'Headers' },
		{ name: 'query_parameters', label: 'Query parameters' }
	];

	var invalidFields = [];

	jsonFields.forEach(function (field) {
		var value = current.getValue(field.name);
		if (value && !isValidJSON(value)) {
			invalidFields.push(field.label);
		}
	});

	if (invalidFields.length > 0) {
		var message = gs.getMessage('Invalid JSON on field(s): {0}', invalidFields.join(', '));
		gs.addErrorMessage(message);
		current.setAbortAction(true);
	}
})(current, previous);
