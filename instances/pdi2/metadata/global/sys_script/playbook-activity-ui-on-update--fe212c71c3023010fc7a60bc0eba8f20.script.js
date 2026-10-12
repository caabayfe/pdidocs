(function executeRule(current, previous /*null when async*/) {
	var setFields = [];
	
	if (current.experience_type.changes())
		setFields.push(current.experience_type.getLabel());
		
	if (current.ui_template.changes())
		setFields.push(current.ui_template.getLabel());
		
	if (setFields.length) {
		gs.addErrorMessage(
			gs.getMessage(
				'The following {0} fields cannot be changed once set: {1}.', 
				[
					current.getClassDisplayValue(),
					setFields.join(', ')
				]
			)
		);
		current.setAbortAction(true);
		return;
	}
	
	if (!current.screen.nil())
		current.macroponent = current.screen.macroponent;
	
	if (current.name.changes() && !current.name.nil()) {
		var grScreen = new GlideRecord("sys_ux_screen");
		var grMacroponent = new GlideRecord("sys_ux_macroponent");

		if (grScreen.get(current.screen)) {
			grScreen.name = current.name;
			grScreen.update();
		}

		if (grMacroponent.get(current.macroponent)) {
			grMacroponent.name = current.name;
			grMacroponent.update();
		}
	}
})(current, previous);
