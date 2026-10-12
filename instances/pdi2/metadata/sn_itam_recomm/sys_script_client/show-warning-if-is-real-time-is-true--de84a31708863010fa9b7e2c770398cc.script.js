function onSubmit() {
	if (g_scratchpad.already_submitted === true) {
		return true;
	}

	var oldValue = g_scratchpad.old_value_is_real_time;
	var newValue = g_form.getValue('is_real_time');

	if (oldValue === 'false' && newValue === 'true') {
		var dlgTitle = getMessage('Warning!');
		var dlgMessage = getMessage(
			'Loading important actions in real time might have a significant impact on the dashboard load time. If load time is greater than 30 seconds, it might result in a timeout error. Do you still wish to proceed?' /* eslint-disable-line */
		);

		var dialog = new GlideModal('glide_modal_confirm', true, 300); /* eslint-disable-line */
		dialog.setTitle(dlgTitle);
		dialog.setPreference('body', dlgMessage);
		dialog.setPreference('onPromptComplete', function () {
			g_scratchpad.already_submitted = true;
			g_form.save();
		});
		dialog.setPreference('onPromptCancel', function () {
			g_form.setValue('is_real_time', false);
		});
		dialog.render();

		return false;
	}
	return true;
}
onSubmit();
