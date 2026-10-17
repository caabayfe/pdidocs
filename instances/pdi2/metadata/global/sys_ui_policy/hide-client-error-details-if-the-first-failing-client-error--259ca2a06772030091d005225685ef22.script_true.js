function onCondition() {
	// needs to be client_errordetails instead of client_error_details because of
	// PRB631900 - setSectionDisplay does not works on section names with multiple spaces
	g_form.setSectionDisplay("client_errordetails", false);
}
