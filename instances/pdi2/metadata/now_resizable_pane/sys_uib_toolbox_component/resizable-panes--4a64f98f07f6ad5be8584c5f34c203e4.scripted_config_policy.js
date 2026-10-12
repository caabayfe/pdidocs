function policy({api, trigger, properties: {disabled, actionBar, actionBarConfig, displayDividerButton, dividerButtonConfig, defaultDisplayedPane, panesPosition, singleColumn}}) { //eslint-disable-line no-unused-vars
	const leftRightDisplayedPaneChoices = [
		{
			label: 'Left pane',
			value: 'left'
		},
		{
			label: 'Right pane',
			value: 'right'
		},
		{
			label: 'Both panes',
			value: 'both'
		},
	];
	const topBottomDisplayedPaneChoices = [
		{
			label: 'Top pane',
			value: 'top'
		},
		{
			label: 'Bottom pane',
			value: 'bottom'
		},
		{
			label: 'Both panes',
			value: 'both'
		},
	];
	const isLeftRight = panesPosition === 'left-right';
	const actionBarEnabled = !disabled && actionBar;

	const middleIconOfLeftRightPanel = 'record-activity-stream-outline';
	const middleIconOfTopBottomPanel = 'record-activity-stream-vertical-outline';
	const isDefaultMiddleIcon = typeof actionBarConfig === 'object' &&
		(actionBarConfig.middleIcon === middleIconOfLeftRightPanel || actionBarConfig.middleIcon === middleIconOfTopBottomPanel);
	// update defaultDisplayedPane choices based on panesPosition
	if (!trigger || trigger === 'panesPosition') {
		api.updateTypeMetadata('defaultDisplayedPane', 'choices', isLeftRight ? leftRightDisplayedPaneChoices : topBottomDisplayedPaneChoices);

		//update middle icon based on panesPosition when it is our default
		if (isDefaultMiddleIcon) {
			actionBarConfig.middleIcon = isLeftRight ? middleIconOfLeftRightPanel : middleIconOfTopBottomPanel;
			api.updateValue('actionBarConfig', actionBarConfig);
		}

		// show displayDividerButton only for left-right panes
		api.updateVisibility('displayDividerButton');

		// show/hide aria-label properties respectively
		api.updateVisibility('leftPaneAriaLabel', isLeftRight);
		api.updateVisibility('rightPaneAriaLabel', isLeftRight);
		api.updateVisibility('topPaneAriaLabel', !isLeftRight);
		api.updateVisibility('bottomPaneAriaLabel', !isLeftRight);
	}

	// hide "Display action bar" toggle when disabled is true.
	if (!trigger || trigger === 'disabled')
		api.updateVisibility('actionBar', !disabled);


	// hide actionBarConfig when "Display action bar" is false.
	if (!trigger || trigger === 'disabled' || trigger === 'actionBar')
		api.updateVisibility('actionBarConfig', actionBarEnabled);

	// show defaultDividerPosition/dividerStyles only if
	// * either defaultDisplayedPane is both
	// * or "Display action bar" is true, so user can switch to show both panes
	if (!trigger || trigger === 'disabled' || trigger === 'actionBar' || trigger === 'defaultDisplayedPane') {
		api.updateVisibility('defaultDividerPosition', defaultDisplayedPane === 'both' || actionBarEnabled);
		api.updateVisibility('dividerStyles', defaultDisplayedPane === 'both' || actionBarEnabled);
	}

	// show singleColumn only when style is left-right
	api.updateVisibility('singleColumn', isLeftRight);

	//Layout and styling section
	if (!trigger || trigger === 'disabled' || trigger === 'actionBar' || trigger === 'defaultDisplayedPane' || trigger === 'panesPosition') {
		api.updateVisibility('leftPaneConstraints', isLeftRight && (actionBarEnabled || defaultDisplayedPane === 'left' || defaultDisplayedPane === 'both'));
		api.updateVisibility('rightPaneConstraints', isLeftRight && (actionBarEnabled || defaultDisplayedPane === 'right' || defaultDisplayedPane === 'both'));
		api.updateVisibility('topPaneConstraints', !isLeftRight && (actionBarEnabled || defaultDisplayedPane === 'top' || defaultDisplayedPane === 'both'));
		api.updateVisibility('bottomPaneConstraints', !isLeftRight && (actionBarEnabled || defaultDisplayedPane === 'bottom' || defaultDisplayedPane === 'both'));
	}

	//show dividerButtonConfig when displayDividerButton is true
	if (!trigger || trigger === 'panesPosition' || trigger === 'displayDividerButton' || trigger === 'dividerButtonConfig') {

		// change invalid user divider button position
		const rightLeftDividerButtonChoices = ['top', 'bottom', 'center'];
		const topBottomDividerButtonChoices = ['left', 'right', 'center'];

		if (!rightLeftDividerButtonChoices.includes(dividerButtonConfig.position) && isLeftRight) {
			dividerButtonConfig.position = 'top';
			api.updateValue('dividerButtonConfig', dividerButtonConfig);
		} else if (!topBottomDividerButtonChoices.includes(dividerButtonConfig.position) && !isLeftRight) {
			dividerButtonConfig.position = 'left';
			api.updateValue('dividerButtonConfig', dividerButtonConfig);
		}

		api.updateVisibility('dividerButtonConfig', displayDividerButton);
	}
}
