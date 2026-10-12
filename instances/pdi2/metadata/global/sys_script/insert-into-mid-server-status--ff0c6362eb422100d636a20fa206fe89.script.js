(function(){
	var eccAgentStatus = new GlideRecord('ecc_agent_status');
	eccAgentStatus.setValue('agent', current.sys_id);
	eccAgentStatus.insert();
})();
