(function executeRule(current, previous /*null when async*/) {
	if ( (previous.active==true && current.active==false) || 
		 (previous.locked_out==false && current.locked_out==true) ) {
		var gr = new GlideRecord('provider_user_map');
		gr.addQuery('user', current.sys_id);
		gr.addQuery('active', true);
		gr.setValue('active',false);
		gr.updateMultiple();
		gs.log('ExternalAuth: provider_user_map is de-activated for user:' + current.sys_id);
	}
})(current, previous);
