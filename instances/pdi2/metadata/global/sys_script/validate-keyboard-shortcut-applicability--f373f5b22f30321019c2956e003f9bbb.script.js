(function executeRule(current, previous /*null when async*/) {
	/*
	 * Purpose: Prevents invalid or duplicate applicability records.
	 * Validates:
	 *   1. Definition is not already the default on the shortcut
	 *   2. No duplicate shortcut + definition combination exists
	 *   3. Label is unique across applicability records
	 */

	var shortcutField = 'keyboard_shortcut';	
	var definitionField = 'keyboard_shortcut_definition';
	var currentSysId = current.getUniqueValue();
	var shortcutValue = current.getValue(shortcutField);
	var definitionValue = current.getValue(definitionField);
	var labelValue = current.getValue('label');

	// Validation 1: Check if definition is already the default on the shortcut
	var shortcutGR = new GlideRecord('sys_ux_keyboard_shortcut');
	if (shortcutGR.get(shortcutValue) && 
		shortcutGR.getValue('definition') == definitionValue) {
		gs.addErrorMessage(gs.getMessage(
			'The definition being added is already the default definition on this shortcut.'
		));
		current.setAbortAction(true);
		return;
	}

	// Validation 2: Check for duplicate shortcut + definition combination
	var duplicateGR = new GlideRecord('sys_ux_keyboard_shortcut_applicability');
	duplicateGR.addQuery('keyboard_shortcut', shortcutValue);
	duplicateGR.addQuery('keyboard_shortcut_definition', definitionValue);
	if (currentSysId) {
		duplicateGR.addQuery('sys_id', '!=', currentSysId);
	}
	duplicateGR.setLimit(1);
	duplicateGR.query();

	if (duplicateGR.hasNext()) {
		gs.addErrorMessage(gs.getMessage(
			'This combination of shortcut and definition already exists.'
		));
		current.setAbortAction(true);
		return;
	}

	// Validation 3: Ensure unique label
	if (labelValue) {
		var labelGR = new GlideRecord('sys_ux_keyboard_shortcut_applicability');
		labelGR.addQuery('label', labelValue);
		if (currentSysId) {
			labelGR.addQuery('sys_id', '!=', currentSysId);
		}
		labelGR.setLimit(1);
		labelGR.query();

		if (labelGR.hasNext()) {
			gs.addErrorMessage(gs.getMessage(
				'Please provide a unique label value.'
			));
			current.setAbortAction(true);
		}
	}

})(current, previous);
