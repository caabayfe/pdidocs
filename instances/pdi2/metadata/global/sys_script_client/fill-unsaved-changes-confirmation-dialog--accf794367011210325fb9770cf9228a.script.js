function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
	}
	
	if (newValue === 'true' && hasDataInUnsavedChangesConfirmationDialog()) {
		setMandatoryAndVisible('unsaved_changes_cancel_button_label', true);
		setMandatoryAndVisible('unsaved_changes_confirm_button_label', true);
		setMandatoryAndVisible('unsaved_changes_confirmation_message_title', true);
		setMandatoryAndVisible('unsaved_changes_confirmation_message_body', true);
		return;
	}
		
		
   //Type appropriate comment here, and begin script below
   if (newValue === 'true') {
		setMandatoryAndVisible('unsaved_changes_cancel_button_label', true);
		g_form.setValue('unsaved_changes_cancel_button_label', getMessage("Stay"));

		setMandatoryAndVisible('unsaved_changes_confirmation_message_title', true);
		g_form.setValue('unsaved_changes_confirmation_message_title', getMessage("You have unsaved changes"));
		
		setMandatoryAndVisible('unsaved_changes_confirm_button_label', true);
		g_form.setValue('unsaved_changes_confirm_button_label', getMessage("Leave"));

		setMandatoryAndVisible('unsaved_changes_confirmation_message_body', true);
		g_form.setValue('unsaved_changes_confirmation_message_body', getMessage("Are you sure you want to leave this page? Changes you made will not be saved."));
   } else {
		setMandatoryAndVisible('unsaved_changes_confirmation_message_title', false);
		setMandatoryAndVisible('unsaved_changes_cancel_button_label', false);
		setMandatoryAndVisible('unsaved_changes_confirm_button_label', false);
		setMandatoryAndVisible('unsaved_changes_confirmation_message_body', false);
   }

   function hasDataInUnsavedChangesConfirmationDialog() {
	var cancel = g_form.getValue('unsaved_changes_cancel_button_label');
	var confirm = g_form.getValue('unsaved_changes_confirm_button_label');
	var title = g_form.getValue('unsaved_changes_confirmation_message_title');
	var body = g_form.getValue('unsaved_changes_confirmation_message_body');
	var hasData = cancel !== "" || confirm !== "" || title !== "" || body !== "";
	return hasData;
   }

   function setMandatoryAndVisible(inputName, value) {
		g_form.setMandatory(inputName, value);
		g_form.setVisible(inputName, value);
   }
}
