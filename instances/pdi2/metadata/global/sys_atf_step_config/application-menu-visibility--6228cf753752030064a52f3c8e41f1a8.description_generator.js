(function generateDescription(step) {
	var description = '';
	var leftNavUtil = new ATFLeftNavUtil();
	var navDisplayValue = step.inputs.navigator.getDisplayValue();

	if (step.inputs.visible_applications.hasMapping())
		description = getVisibleDescription(step.inputs.visible_applications.getDisplayValue());
	else if (step.inputs.visible_applications) {
		var visibleAppTitles = leftNavUtil.getTitles('sys_app_application', step.inputs.visible_applications.split(','));
		visibleAppTitles = visibleAppTitles.join(', ');
		description = getVisibleDescription(visibleAppTitles);
	}

	if (step.inputs.not_visible_applications.hasMapping())
		description += getNotVisibleDescription(step.inputs.not_visible_applications.getDisplayValue());
	else if (step.inputs.not_visible_applications) {
		var notVisibleAppTitles = leftNavUtil.getTitles('sys_app_application', step.inputs.not_visible_applications.split(','));
		notVisibleAppTitles = notVisibleAppTitles.join(', ');
		description += getNotVisibleDescription(notVisibleAppTitles);
	}

	function getVisibleDescription(visibleAppTitles) {
		var visibleAssertType = step.inputs.visible_assert_type + '';
		switch (visibleAssertType) {
			case 'at_least_applications_visible':
				return gs.getMessage('Confirm that at least the following application menus are visible in {0}: {1}', [navDisplayValue, visibleAppTitles]);
			case 'only_applications_visible':
				return gs.getMessage('Confirm that only the following application menus are visible in {0}: {1}', [navDisplayValue, visibleAppTitles]);
			default:
				return gs.getMessage('Unknown visible assert type: {0}', visibleAssertType);
		}
	}

	function getNotVisibleDescription(notVisibleAppTitles) {
		var notVisibleAssertType = step.inputs.not_visible_assert_type + '';
		switch (notVisibleAssertType) {
			case 'at_least_applications_not_visible':
				return (description ? '\n\n' : '') + gs.getMessage('Confirm that at least the following application menus are not visible in {0}: {1}', [navDisplayValue, notVisibleAppTitles]);
			case 'only_applications_not_visible':
				return (description ? '\n\n' : '') + gs.getMessage('Confirm that only the following application menus are not visible in {0}: {1}', [navDisplayValue, notVisibleAppTitles]);
			default:
				return (description ? '\n\n' : '') + gs.getMessage('Unknown visible assert type: {0}', notVisibleAssertType);
		}
	}

	if (gs.nil(description))
		description = gs.getMessage("This step will do nothing. Provide at least one application menu to assert as visible or not visible");

	return description;
})(step);
