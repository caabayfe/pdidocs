function onChange() {
	g_form.setValue('branding_key', g_form.getValue('branding_name').toLowerCase().replace(/\s/g,'_'));
}
