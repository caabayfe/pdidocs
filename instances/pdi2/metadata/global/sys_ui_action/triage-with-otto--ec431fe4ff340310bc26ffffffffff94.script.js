(function() {
	if (!GlidePluginManager.isActive("com.sn_build_agent")) {
		gs.addInfoMessage(gs.getMessage("This action requires Build Agent, contact a system administrator"));
		action.setRedirectURL(current);
		return;
	}

	var url = gs.getProperty("sn_atf.build_agent.redirect_url", "sn_glider_app/servicenow_studio.do");
	var message = encodeURIComponent(gs.getMessage("Triage ATF test failure with sys_id {0}", current.getUniqueValue()));
	action.setRedirectURL(url + "?preprompt=" + message);
})();
