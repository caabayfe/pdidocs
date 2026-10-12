function onClick() {
	//Set the 'Incident state' and 'State' values to 'Resolved', and display mandatory fields
	g_form.setValue('incident_state', 6);
	g_form.setValue('state', 6);
	g_form.setValue('resolved_by', g_user.userID, g_user.getFullName());

	// Call the UI Action and skip the 'onclick' function
	g_form.submit(g_form.getActionName());
}
