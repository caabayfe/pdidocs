(function executeRule(current, previous /*null when async*/) {	
	var emptyValue = 'NULL';
	
	if (current.ui_selector.nil()) {
		current.activity_ui = emptyValue;
		current.renderer = emptyValue;
		return;
	} 
	
	if (current.getValue('ui_selector') == 'activity_ui') {
		if (current.activity_ui.nil()) {
			gs.addErrorMessage(
				gs.getMessage('{0} cannot be empty.', current.activity_ui.getLabel())
			);
			current.setAbortAction(true);
		} else {
			current.renderer = emptyValue;
		}
	} else if (current.getValue('ui_selector') == 'renderer') {
		if (current.renderer.nil()) {
			gs.addErrorMessage(
				gs.getMessage('{0} cannot be empty.', current.renderer.getLabel())
			);
			current.setAbortAction(true);
		} else {
			current.activity_ui = emptyValue;
		}
	}
})(current, previous);
