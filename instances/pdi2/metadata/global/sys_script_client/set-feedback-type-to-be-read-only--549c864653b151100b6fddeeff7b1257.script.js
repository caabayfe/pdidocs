function onLoad() {
	var feedbackType = g_form.getValue('feedback_type');
	
	// Do not set field to read-only if the field is empty
	if (!feedbackType) {
		g_form.setReadOnly('feedback_type', false);
		return;
	}
	
	g_form.setReadOnly('feedback_type', true);
}
