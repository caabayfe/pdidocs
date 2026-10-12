function onCondition() {
	if (g_form.isNewRecord()) 
		if (getView() == 'oauth_simplified_provider')
			g_form.setValue('default_grant_type', 'authorization_code');
}
