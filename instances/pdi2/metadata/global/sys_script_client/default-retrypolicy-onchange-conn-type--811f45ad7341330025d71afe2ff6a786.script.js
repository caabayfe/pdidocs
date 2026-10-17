function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '') {
		return;
	}
	if (newValue == "http_connection") 
		g_form.setValue('retry_policy', 'ef751ff07301330025d71afe2ff6a7f9');
	else if (newValue == "sys_connection")
		g_form.setValue('retry_policy', 'e385484773100010e3a71afe2ff6a709');
	else if (newValue == "jdbc_connection")
		g_form.setValue('retry_policy', 'e8ddcb7573331010cbfec9d234f6a7fd');
	else 
		g_form.setValue('retry_policy', '');
}
