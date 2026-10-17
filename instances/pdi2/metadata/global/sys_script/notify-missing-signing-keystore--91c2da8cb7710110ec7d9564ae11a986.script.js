(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord("saml2_assertion_keystore");
	gr.initialize();
	gr.addQuery("saml2_assertion_producer", current.sys_id);
	gr.query();
	
	if(!gr.hasNext())
		gs.addErrorMessage(gs.getMessage("Your configuration has missing Assertion Keystore."));

})(current, previous);
