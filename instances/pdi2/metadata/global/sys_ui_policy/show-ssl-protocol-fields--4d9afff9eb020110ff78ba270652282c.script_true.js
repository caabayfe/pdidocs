function onCondition() {
	
	g_form.setMandatory('keystore', true);
	g_form.setMandatory('keystore_password', true);
	g_form.setMandatory('truststore', true);
	g_form.setMandatory('truststore_password', true);
	g_form.setMandatory('key_password', true);
	g_form.setMandatory('user_name', false);
	g_form.setMandatory('password', false);
	g_form.setMandatory('sasl_mechanism', false);
	g_form.setMandatory('sasl_jaas_config', false);
	
    g_form.setDisplay('keystore', true);
	g_form.setDisplay('keystore_password', true);
	g_form.setDisplay('keystore_type', true);
	g_form.setDisplay('key_password', true);
	g_form.setDisplay('truststore', true);
	g_form.setDisplay('truststore_password', true);
	g_form.setDisplay('truststore_type', true);
	g_form.setDisplay('ssl_provider_name', true);
	g_form.setDisplay('disable_hostname_verification', true);	
	g_form.setDisplay('user_name', false);
	g_form.setDisplay('password', false);
	g_form.setDisplay('sasl_mechanism', false);
	g_form.setDisplay('sasl_jaas_config', false);
	
	
}
