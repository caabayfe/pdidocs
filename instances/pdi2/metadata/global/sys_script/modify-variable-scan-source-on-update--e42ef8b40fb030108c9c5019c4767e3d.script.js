(function executeRule(current, previous /*null when async*/) {
	
	// If the current and previous scan instance values are different, that is interpreted as a rescan
	// that is in process. In that case, do not change the scan source because values can change during
	// a rescan.

	var currentScanInstance = current.getValue('scan_instance');
	var previousScanInstance = previous.getValue('scan_instance');
	
	if (currentScanInstance !== previousScanInstance)
		return;
	
	// Scan source is 'scan' and scan instance variables are the same. This is interpreted as a user
	// modification. Need to ensure that a record value has actually been modified before modifying the
	// scan source. The fields of concern are the following: name, type, original_value, run_script, template_execution_script
	
	if (hasAnyVariableFieldsChanged(current, previous)) {
		current.setValue('scan_source', 'manual');
		return;
	}
	
	function hasAnyVariableFieldsChanged(current, previous) {
		return hasVariableNameChanged(current, previous)
			|| hasVariableTypeChanged(current, previous)
			|| hasVariableOriginalValueChanged(current, previous)
			|| hasVariableExecutionScriptChanged(current, previous);
	}
	
	function hasVariableNameChanged(current, previous) {
		return current.name !== previous.name;
	}

	function hasVariableTypeChanged(current, previous) {
		return current.type.getUniqueValue() !== current.type.getUniqueValue();
	}

	function hasVariableOriginalValueChanged(current, previous) {
		return current.original_value !== current.original_value;
	}

	function hasVariableExecutionScriptChanged(current, previous) {
		return current.run_script.getBooleanAttribute() != previous.run_script.getBooleanAttribute() ||
			current.template_execution_script !== previous.template_execution_script;
	}
	
})(current, previous);
