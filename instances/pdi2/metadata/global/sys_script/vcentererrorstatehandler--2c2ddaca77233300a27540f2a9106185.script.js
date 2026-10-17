(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('ecc_agent_ext_context_vcenter');
	if (gr.get('vcenter',current.sys_id)){
		gr.setValue('status', 'Error');
		if (gr.update())
			gs.info(gs.getMessage("vCenter Event Collector Context: '{0}' updated to error state successfully on vCenter: '{1}' deletion", [gr.name, current.name]));
		else
			gs.info(gs.getMessage("Failed to update vCenter Event Collector Context: '{0}' error state on vCenter: '{1}' deletion", [gr.name, current.name]));
	}
})(current, previous);
