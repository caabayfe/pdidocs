function onLoad(){
	if (g_form.isNewRecord()) {
		g_form.setValue('read_access', true);
		g_form.setValue('required_user_role_names', "snc_internal");
	}
}
