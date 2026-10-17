(function executeRule(current, previous /*null when async*/) {
	
	var gURI = "";
	try {
		gURI = gs.action.getGlideURI();
	} catch(e) {
		// non-UI requests do not handle
		return;
	}

	// handle the UI based request, by showing the info message
	if ((gURI.toString().indexOf("oauth_oidc_entity.do") == 0)) {
		gs.addInfoMessage(gs.getMessage("switch_to_new_inbound_integration_experience_record_message"));
	}

})(current, previous);
