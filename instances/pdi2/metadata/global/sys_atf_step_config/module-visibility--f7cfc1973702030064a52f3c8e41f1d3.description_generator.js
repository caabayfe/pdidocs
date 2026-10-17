(function generateDescription(step) {
	var description = '';
	var leftNavUtil = new ATFLeftNavUtil();
	var navDisplayValue = step.inputs.navigator.getDisplayValue();

	if (step.inputs.visible_modules.hasMapping())
		description = getVisibleDescription(step.inputs.visible_modules.getDisplayValue());
	else if (step.inputs.visible_modules) {
		var visibleModuleTitles = leftNavUtil.getTitles('sys_app_module', step.inputs.visible_modules.split(','));
		visibleModuleTitles = visibleModuleTitles.join(', ');
		description = getVisibleDescription(visibleModuleTitles);
	}

	if (step.inputs.not_visible_modules.hasMapping())
		description += getNotVisibleDescription(step.inputs.not_visible_modules.getDisplayValue());
	else if (step.inputs.not_visible_modules) {
		var notVisibleModuleTitles = leftNavUtil.getTitles('sys_app_module', step.inputs.not_visible_modules.split(','));
		notVisibleModuleTitles = notVisibleModuleTitles.join(', ');
		description += getNotVisibleDescription(notVisibleModuleTitles);
	}

	function getVisibleDescription(visibleModuleTitles) {
		var visibleAssertType = step.inputs.visible_assert_type + '';
		switch (visibleAssertType) {
			case 'at_least_modules_visible':
				return gs.getMessage('Confirm that at least the following modules are visible in {0}: {1}', [navDisplayValue, visibleModuleTitles]);
			case 'only_modules_visible':
				return gs.getMessage('Confirm that only the following modules are visible in {0}: {1}', [navDisplayValue, visibleModuleTitles]);
			default:
				return gs.getMessage('Unknown visible assert type: {0}', visibleAssertType);
		}
	}

	function getNotVisibleDescription(notVisibleModuleTitles) {
		var notVisibleAssertType = step.inputs.not_visible_assert_type + '';
		switch (notVisibleAssertType) {
			case 'at_least_modules_not_visible':
				return (description ? '\n\n' : '') + gs.getMessage('Confirm that at least the following modules are not visible in {0}: {1}', [navDisplayValue, notVisibleModuleTitles]);
			case 'only_modules_not_visible':
				return (description ? '\n\n' : '') + gs.getMessage('Confirm that only the following modules are not visible in {0}: {1}', [navDisplayValue, notVisibleModuleTitles]);
			default:
				return (description ? '\n\n' : '') + gs.getMessage('Unknown not visible assert type: {0}', notVisibleAssertType);
		}
	}

	if (gs.nil(description))
		description = gs.getMessage("This step will do nothing. Provide at least one module to assert as visible or not visible");

	return description;
})(step);
