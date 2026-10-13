(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('discovery_probes_wmi_field');
	gr.addQuery('sys_name', 'CONTAINS', 'Package_for_RollupFix');
    gr.query();
	if (current.value == "true" && previous.value == "false"){
		gr.setValue('active',true);
		gr.updateMultiple(); 
	}
	else{
		gr.setValue('active',false);
		gr.updateMultiple(); 
	}

})(current, previous);
