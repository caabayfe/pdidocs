answer = verifyCustomConnection();

function verifyCustomConnection() {
	
	var isVAAdmin = gs.hasRole("virtual_agent_admin");
	var gr = new GlideRecord('sys_cs_bot_messages');
	gr.addQuery('sys_cs_provider_application.provider.channel.store_app_page_link', '');
	gr.query();
	if (gr.next() || isVAAdmin)
		return true;
	
	return false; 
}
	
