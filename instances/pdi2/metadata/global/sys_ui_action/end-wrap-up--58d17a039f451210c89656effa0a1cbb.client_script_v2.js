function onClick(g_form) {
	
	g_form.setValue('state', 'closed_complete');
	g_form.save();
	
	return false;
}
