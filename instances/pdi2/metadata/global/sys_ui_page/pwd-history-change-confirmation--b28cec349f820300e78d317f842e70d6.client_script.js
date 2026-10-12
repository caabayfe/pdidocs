function updateRecord(action) {
	if (action && action == "submit") {
		gsftSubmit(null, g_form.getFormElement(), "sysverb_update");
		return;
	}
			
	gsftSubmit(null, g_form.getFormElement(), "sysverb_update_and_stay");
}
