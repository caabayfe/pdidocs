(function generateDescription(step) {
	var hasWait = step.timeout.dateNumericValue() > 0;

	if (step.inputs.module.hasMapping()) {
		if (hasWait)
			return gs.getMessage("Navigate to the module {0}. Then wait {1}", [step.inputs.module.getDisplayValue(), step.timeout.getDisplayValue()]);

		return gs.getMessage("Navigate to the module {0}", step.inputs.module.getDisplayValue());
	}

	var gr = new GlideRecord('sys_app_module');
	gr.get(step.inputs.module);
	var modTitle = gr.title + '';
	var appTitle = gr.application ? gr.application.title + '' : '';
	if (hasWait)
		return gs.getMessage("Navigate to the '{0}' module in the '{1}' application. Then wait {2}",
			[modTitle, appTitle, step.timeout.getDisplayValue()]);

	return gs.getMessage("Navigate to the '{0}' module in the '{1}' application", [modTitle, appTitle]);
})(step);
