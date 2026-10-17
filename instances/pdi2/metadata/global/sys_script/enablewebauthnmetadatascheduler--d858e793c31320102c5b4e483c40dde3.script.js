(function executeRule(current, previous /*null when async*/) {
	gs.debug("WebAuthnLog: Start: BR to enable schedule job if metadata integration is enabled.");
	
	if(current.metadata_integration_enable == true && !!current.metadata_url && !!current.metadata_token) {
		var gr = new GlideRecord("sysauto_script");

		if(!gr.isValid()) {
			gs.debug("WebAuthnLog: Unable to create instance for sysauto_script");
			return;
		}

		gr.addQuery("name", "WebAuthenticationMetadataRefresh");
		gr.addQuery("active", false);
		gr.query();

		if(gr.next()) {
			gs.debug("WebAuthnLog: Enabling WebAuthenticationMetadataRefresh scheduler job");
			gr.setValue('active', true);
			gr.update();
		}
		
		gs.debug("WebAuthnLog: End: BR to enable schedule job if metadata integration is enabled.");
	}

})(current, previous);
