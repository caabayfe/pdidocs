function onClick() {

	if (g_form.getValue('comments') == '') {
		// Remove any existing field message, set comments mandatory, and show a new field message
		try {
			g_form.hideFieldMsg('comments');
		} catch(e) {

		}
		g_form.setMandatory('comments', true);
		g_form.showFieldMsg('comments', getMessage('Please enter a comment when reopening an Incident'), 'error');
		return false;  // Abort submission
	}

	// Call the UI Action and skip the 'onclick' function
	g_form.submit(g_form.getActionName());
}
