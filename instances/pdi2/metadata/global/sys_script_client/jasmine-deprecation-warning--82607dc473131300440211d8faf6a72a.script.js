function onLoad() {
	// Only run this on "Run Server Side Script" test steps
	if (g_form.getValue('step_config') !== '41de4a935332120028bc29cac2dc349a')
		return;

	// Get the currently selected Jasmine version
	var oldValue = g_form.getValue('jasmine_version');
	
	// Get the Jasmine versions string from the scratchpad and split it into an array of versions
	var versions = g_scratchpad.jasmine_versions.split(',');
	
	// Get the choice element and its current onchange handler
	var stepConfig = g_form.getValue('step_config');
	var choice = g_form.getElement('sys_atf_step.inputs.var__m_atf_input_variable_' + stepConfig + '.jasmine_version');
	var currentOnChange = choice.onchange;
	choice.onchange = function() {
		// Intentionally not calling the old onchange yet, since the user might decide to revert their change with the modal
		// If that happens we obviously shouldn't call the onchange handler since no changes were made!
		// (This prevents the form from being marked as "dirty" even after the change was reverted)
		
		// We only confirm if they're switching away from a deprecated version, not if they're switching into a deprecated version or away from a non-deprecated one
		if (versions.indexOf(oldValue) < 0) {
			var msg = formatMessage(getMessage('Jasmine {0} is no longer supported. Upgrading this record to Jasmine {1} cannot be undone after save. Confirm upgrade?'), oldValue, choice.value);
			var dialog = new GlideModal('glide_modal_confirm', true, 300);
			dialog.setTitle(getMessage('Confirmation'));
			dialog.setPreference('body', msg);
			dialog.setPreference("focusTrap", true);
			dialog.setPreference('buttonClassComplete', 'btn-primary');
			
			dialog.setPreference('onPromptComplete', function() {
				oldValue = choice.value;
				
				// If the element already had an onChange method we need to ensure that it continues to be called normally
				if (currentOnChange && typeof currentOnChange === 'function')
					currentOnChange();
			});
			
			dialog.setPreference('onPromptCancel', function() {
				choice.value = oldValue;
				// No onchange called here since the change was reverted
			});
			
			dialog.render();
		} else {
			// Not switching away from a deprecated value but still need to maintain the oldValue and call the onchange handler
			oldValue = choice.value;
			if (currentOnChange && typeof currentOnChange === 'function')
				currentOnChange();
		}
	};
}
