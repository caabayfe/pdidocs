function onLoad() {
	// If this record has already been saved to the database, you cannot change the application field.
	g_form.setReadOnly('sys_package', !g_form.isNewRecord());
}
