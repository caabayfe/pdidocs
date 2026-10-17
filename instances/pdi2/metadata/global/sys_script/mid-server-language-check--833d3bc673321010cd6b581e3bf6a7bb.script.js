(function executeRule(current, previous) {

	// Ensure that mid server user's language is always set to English/None
	
	var userGr = new GlideRecord('sys_user');
	userGr.addQuery('user_name', current.user_name);
	userGr.query();
	
	if (userGr.next()) {
		if (userGr.preferred_language != 'en' && !JSUtil.nil(userGr.preferred_language)) {
			var gr = new GlideRecord('ecc_agent_issue');
			gr.addQuery('mid_server', current.sys_id);
			gr.addQuery('source', 'LanguageCheck');
			gr.addQuery('state','!=','resolved');
			gr.query();

			if (gr.next()) {
				gr.setValue('last_detected', new GlideDateTime());
				gr.update();
			} else {
				gr.initialize();
				gr.setValue('mid_server', current.sys_id);
				gr.setValue('source', 'LanguageCheck');
				gr.setValue('message', 'Set mid server user\'s: '+current.user_name+' language to English/None on the user record');
				gr.setValue('state','new');
				gr.insert();
			}
		}
	}
	
})(current, previous);
