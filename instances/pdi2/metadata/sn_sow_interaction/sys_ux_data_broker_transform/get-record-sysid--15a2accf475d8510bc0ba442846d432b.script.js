function transform(input) {
	var output = {};
    var chatGr = new GlideRecord('sn_tcm_collab_hook_ms_teams_chat');
	chatGr.addQuery('interaction', input.interactionSysId);
	chatGr.query();
	var sysId;
	if(chatGr.next())
		sysId = chatGr.getValue('sys_id');
	output.sysId = sysId;
	
	return output;
}
