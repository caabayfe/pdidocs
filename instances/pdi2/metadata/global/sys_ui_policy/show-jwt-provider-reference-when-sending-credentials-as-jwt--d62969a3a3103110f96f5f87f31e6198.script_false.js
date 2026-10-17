function onCondition() {
	// when NOT using pvt_key_jwt remove mandate and hide jwt_provider
	g_form.setMandatory("jwt_provider", false);
	g_form.setDisplay("jwt_provider", false);
}
