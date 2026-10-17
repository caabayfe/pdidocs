(function executeRule(current, previous /*null when async*/) {

	var CONDITION_FIELDS = ['condition', 'exit_condition'];

	for (var i = 0; i < CONDITION_FIELDS.length; i++) {
		var field = CONDITION_FIELDS[i];
		var value = String(current.getValue(field) || '');

		if (value.toLowerCase().indexOf('javascript:') === -1)
			continue;

		current.setValue(field, '');
		gs.warn('[IAR Configuration] Rejected ' + field + ' containing a "javascript:" operand, submitted by user: ' + gs.getUserName());
		gs.addErrorMessage(gs.getMessage('The {0} field contains an unsupported "javascript:" expression and was not saved.', [field]));
	}

})(current, previous);
