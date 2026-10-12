(function executeRule(current, previous /*null when async*/) {
	if (current.controller_macroponent != previous.controller_macroponent) {
		var controller = new GlideRecord('sys_ux_controller');
		controller.addQuery('controller_macroponent', current.controller_macroponent);
		controller.query();

		if (controller.next()) {
			gs.addErrorMessage(gs.getMessage("A sys_ux_controller record already exists that uses the selected Definition.  Utilizing the same macroponent definition for two controllers is not supported."));
			current.setAbortAction(true);
		}
	}
})(current, previous);
