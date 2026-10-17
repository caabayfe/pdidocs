(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord('mid_profile_config');
    gr.addQuery("profile", current.sys_id);
    gr.addQuery("name", 'url');
    gr.query();
	if (gr.next()) {
		var instanceUrl = gs.getProperty("glide.servlet.uri");
		var url = gr.getValue('value');
		if (url != instanceUrl) 
			gs.addInfoMessage(gs.getMessage("Url config parameter doesn't match the current instance url"));
	} else {
		gs.addInfoMessage(gs.getMessage("Url config parameter missing (Required for new MID server deployment)"));
	}
})(current, previous);
