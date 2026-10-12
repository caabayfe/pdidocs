function onCondition() {
	if (g_form.isNewRecord()) {
		g_form.setValue('requires_acl_authorization', true);
	}
}
