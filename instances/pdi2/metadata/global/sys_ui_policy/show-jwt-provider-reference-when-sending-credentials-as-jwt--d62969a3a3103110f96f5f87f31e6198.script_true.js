function onCondition() {
	// when using pvt_key_jwt show the option to select jwt provider and mandate it 
	g_form.setMandatory("jwt_provider", true);
	g_form.setDisplay("jwt_provider", true);

	// client_secret not required for private_key_jwt
	g_form.setMandatory("client_secret", false);
}
