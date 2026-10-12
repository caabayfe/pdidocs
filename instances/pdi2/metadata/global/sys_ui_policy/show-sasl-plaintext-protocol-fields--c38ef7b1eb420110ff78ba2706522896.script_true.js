function onCondition() {
	
	g_form.setMandatory('keystore', false);
	g_form.setMandatory('keystore_password', false);
	g_form.setMandatory('truststore', false);
	g_form.setMandatory('truststore_password', false);
	g_form.setMandatory('key_password', false);
	g_form.setMandatory('user_name', true);
	g_form.setMandatory('password', true);
	g_form.setMandatory('sasl_mechanism', false);
	g_form.setMandatory('sasl_jaas_config', false);
	
    g_form.setDisplay('keystore', false);
	g_form.setDisplay('keystore_password', false);
	g_form.setDisplay('keystore_type', false);
	g_form.setDisplay('key_password', false);
	g_form.setDisplay('truststore', false);
	g_form.setDisplay('truststore_password', false);
	g_form.setDisplay('truststore_type', false);
	g_form.setDisplay('ssl_provider_name', false);
	g_form.setDisplay('disable_hostname_verification', false);	
	g_form.setDisplay('ssl_provider_name', false);
	g_form.setDisplay('user_name', true);
	g_form.setDisplay('password', true);
	g_form.setDisplay('sasl_mechanism', false);
	g_form.setDisplay('sasl_jaas_config', false);
	
}
