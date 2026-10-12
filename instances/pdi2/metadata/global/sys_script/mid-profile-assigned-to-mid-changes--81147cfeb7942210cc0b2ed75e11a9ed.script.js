(function executeRule(current, previous) {
    var link = '<a href="mid_server_profile.do?sys_id=' + current.profile_id + '">'+gs.getMessage("MID Profile Url")+'</a>';
    if (current.getValue('status') === 'Down') {
        gs.addErrorMessage(gs.getMessage("WARNING: Profile assigned changed on 'Down' MID Server. Profile will get overwritten with the value on MID Server once it is 'UP'."));
    } else {
        if (current.profile_id != "") {
            var messages = gs.getInfoMessages();
            if (messages.toString().indexOf('Profile settings successfully synced to MID servers.') == -1)
                gs.addErrorMessage(gs.getMessage("WARNING: Profile is not synced to newly added MID(s). Use the Sync to MID Servers UI action in {0}", link));
        } else {
            gs.addErrorMessage(gs.getMessage("WARNING: Profile assigned removed, MID Server will retain existing configuration."));
        }
        //Update mid_profile_id config param
        updateOrCreateProfileConfig();
    }
})(current, previous);

function updateOrCreateProfileConfig() {
    //Update mid_profile_id config param
    var gr = new GlideRecord("ecc_agent_config");
    gr.addQuery('ecc_agent', current.sys_id);
    gr.addQuery('param_name', 'mid_profile_id');
    gr.query();
    if (gr.next()) {
		if(gr.getValue('value') != current.profile_id){
			gr.setValue('value', current.profile_id);
			gr.setWorkflow(false);
			gr.update();
		} 
    } else {
        gr.initialize();
        gr.setValue('param_name', 'mid_profile_id');
        gr.setValue('ecc_agent', current.sys_id);
        gr.setValue('value', current.profile_id);
        gr.setWorkflow(false);
        gr.insert();
    }
}
