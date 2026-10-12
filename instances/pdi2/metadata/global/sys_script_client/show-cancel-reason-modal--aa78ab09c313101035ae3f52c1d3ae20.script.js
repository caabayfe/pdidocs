function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '' || g_form.isLiveUpdating())
		return;

	var intOldValue = parseInt(oldValue, 10);
	var intNewValue = parseInt(newValue, 10);

	// We don't open the dialog if the state isn't Canceled AND if the old and new values for state are both Canceled
	// This function can fire when the state field is updated via script to ensure it's populated correctly
	if (intNewValue !== 4 || (intOldValue === intNewValue && intOldValue === 4))
		return;

	var workNotesComplete = false;

	var dialog = new GlideModal('change_confirm_reason', false, 648, 250);
	dialog.setTitle(new GwtMessage().getMessage('Cancel Change Request'));
	dialog.setPreference('focusTrap', true);
	dialog.setPreference('onPromptComplete', onPromptComplete);
	dialog.setPreference('onPromptCancel', onPromptCancel);
	dialog.on('closeconfirm', onPromptCancel);
	dialog.setPreference('buttonLabelComplete', new GwtMessage().getMessage('OK'));
	dialog.setPreference('buttonLabelCancel', new GwtMessage().getMessage('Cancel'));
	dialog.render();

	function onPromptComplete(notes) {
		workNotesComplete = true;
		g_form.setValue("work_notes", notes);
		gsftSubmit(null, g_form.getFormElement(), "state_model_move_to_canceled");
	}

	function onPromptCancel() {
		if (workNotesComplete)
			return;

		g_form.setValue("state", oldValue);
	}
}
