(function executeRule(current, previous) {
	var actionScript = "(function(inputs, outputs){\r\n // Add script here\r\n \r\n })(inputs, outputs);";
	var applicabilityScript = "(function(){\r\n // Add script here\r\n \r\n })();";
	validateScriptForField('action_script', actionScript);
	validateScriptForField('applicability_script', applicabilityScript);

	function validateScriptForField(fieldName, script) {
		var value = current.getValue(fieldName);
		if (value === script) {
			current.setValue(fieldName, '');
		}
	}
})(current, previous);
