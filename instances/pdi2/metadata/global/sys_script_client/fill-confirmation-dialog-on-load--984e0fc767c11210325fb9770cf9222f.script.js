function onLoad() {
   //Type appropriate comment here, and begin script below
   if (!g_form.getBooleanValue('show_unsaved_changes_confirmation_message', false)) {
		setMandatoryAndVisible('unsaved_changes_confirmation_message_title', false);
		setMandatoryAndVisible('unsaved_changes_cancel_button_label', false);
		setMandatoryAndVisible('unsaved_changes_confirm_button_label', false);
		setMandatoryAndVisible('unsaved_changes_confirmation_message_body', false);

   } else {
		setMandatoryAndVisible('unsaved_changes_confirmation_message_title', true);
		setMandatoryAndVisible('unsaved_changes_cancel_button_label', true);
		setMandatoryAndVisible('unsaved_changes_confirm_button_label', true);
		setMandatoryAndVisible('unsaved_changes_confirmation_message_body', true);
   }

   function setMandatoryAndVisible(inputName, state) {
		g_form.setMandatory(inputName, state);
		g_form.setVisible(inputName, state);
   }
}
