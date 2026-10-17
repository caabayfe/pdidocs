(function executeRule(current, previous /*null when async*/) {
	var gURI = "";
	try {
		gURI = gs.action.getGlideURI();
	} catch(e) {
		// non-UI requests do not handle
		return;
	}
	// reject URIs like oauth_entity.do?isFormPage=true&ni.java.com.glide.ui_list_edit.ListEditFormat...	
	if(gURI.toString().indexOf("isFormPage=true") > 0) {
		return;
	}

    var view_name = gURI.get('sysparm_view');

	// handle the UI based request, by showing the info message, exclude outbound cases
	if ((gURI.toString().indexOf("oauth_entity.do") == 0) && view_name && view_name != 'oauth_provider' && view_name != 'oauth_simplified_provider') {
		// handle record view
		gs.addInfoMessage(gs.getMessage("switch_to_new_inbound_integration_experience_record_message"));
	}
	else if (gURI.toString().indexOf("oauth_entity_list.do") == 0 && gs.nil(view_name)) {
		// handle list view
		gs.addInfoMessage(gs.getMessage("switch_to_new_inbound_integration_experience_list_message"));
	}
	
})(current, previous);
