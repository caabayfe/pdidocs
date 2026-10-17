migrateSecurityConfigs();

function migrateSecurityConfigs(){
	var gr = new GlideRecord("ws_security_x509_profile_outbound");
	if(isMatchingSecurityProfileFound(gr)){
		// matching security profile exists
		current.ws_security_x509_profile = gr.getUniqueValue();
	} else {
		// Insert a new record in WS-Security X.509 Profiles (Outbound)
		gr.initialize();
		gr.key_store = current.key_store;
		gr.key_store_alias = current.key_store_alias;
		gr.key_store_password = current.key_store_password;
		gr.certificate = current.certificate;
		gr.name = current.key_store_alias;
		// WS-Security X.509 Profile is linked to this new record
		current.ws_security_x509_profile = gr.insert();
	}	
	current.ws_security_type = new ChoiceListHelper("sys_soap_message_function", "ws_security_type").getChoiceSysId("X.509");
	
	clearSecurityConfigOnCurrentRecord();
	current.update();
	
	action.setRedirectURL(current);
	
	gs.addInfoMessage('The system migrated the X.509 configuration to the "WS-Security X.509 Profiles (Outbound)" table. The field "WS-Security X.509 profile" references the newly created record.');
}

function isMatchingSecurityProfileFound(gr){
	gr.addQuery('key_store',current.key_store);
	gr.addQuery('key_store_alias',current.key_store_alias);
	gr.addQuery('key_store_password',current.key_store_password);
	gr.addQuery('certificate',current.certificate);
	gr.addQuery('name',current.key_store_alias);
	gr.query();
	return gr.next();
}

function clearSecurityConfigOnCurrentRecord(){
	current.use_ws_security = false;
	current.key_store = "";
	current.key_store_alias = "";
	current.key_store_password = "";
	current.certificate = "";
}
