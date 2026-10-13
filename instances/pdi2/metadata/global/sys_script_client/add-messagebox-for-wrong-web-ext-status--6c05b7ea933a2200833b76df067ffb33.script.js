function onLoad() {

	var web_ext = g_form.getValue("web_ext");
	if (web_ext) { //don't work for first insert
	
		var gr = new GlideRecord('ecc_agent_ext_context_webserver');
		gr.get(web_ext);
	
		if ((gr.status != "Started") && (g_form.getValue("status") == "Started")){ //not started but our is started
			g_form.addErrorMessage("Extension might not work since the MID Web Server Extension's status is not Started");
		}			
	}
	
}
