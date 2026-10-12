(function executeRule(current, previous /*null when async*/) {
	if (gs.nil(current.profile) || gs.nil(current.parameter))
		return;

	var gr = new GlideRecord('ais_request_parameter_override');
	gr.addQuery('profile', current.profile);
	gr.addQuery('parameter', current.parameter);
	gr.addQuery('sys_id', '!=', current.sys_id);
	gr.query();
	if (gr.next()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('An override for this parameter already exists on this profile'));
		return;
	}

	validateValueConformsToValueType();

	function validateValueConformsToValueType() {
		var valueType = current.parameter.value_type + '';
		var value = current.value + '';
		var error = getValueTypeError(valueType, value);
		if (error) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage('Invalid value for parameter \'{0}\': {1}', [current.parameter.parameter + '', error]));
		}
	}

	// Minimum viable conformance checks - not full JSON-schema validation, just enough to catch an
	// obviously wrong value at save time instead of a silent skip later at search-execution time.
	function getValueTypeError(valueType, value) {
		switch (valueType) {
			case 'BOOLEAN':
				return /^(true|false)$/i.test(value) ? null : 'must be "true" or "false"';
			case 'INTEGER':
				return /^-?\d+$/.test(value) ? null : 'must be a valid integer';
			case 'FLOAT':
				return /^-?\d+(\.\d+)?([eE][-+]?\d+)?$/.test(value) ? null : 'must be a valid number';
			case 'JSON':
				return isValidJson(value) ? null : 'must be valid JSON';
			case 'STRING_LIST':
				return isValidJsonArray(value) ? null : 'must be a valid JSON array, e.g. ["a","b"]';
			default:
				return null; // STRING (or unknown future type): no format constraint
		}
	}

	function isValidJson(value) {
		try {
			JSON.parse(value);
			return true;
		} catch (e) {
			return false;
		}
	}

	function isValidJsonArray(value) {
		try {
			return Array.isArray(JSON.parse(value));
		} catch (e) {
			return false;
		}
	}
})(current, previous);
