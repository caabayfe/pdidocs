(function executeRule(current, previous /*null when async*/) {
	if (!current.workflow_version)
		return;

	incrementSysModCount(current.workflow_version);
})(current, previous);

function incrementSysModCount(wf_v_sys_id) {
	var gr = new GlideRecord("wf_workflow_version");
	if (gr.get(wf_v_sys_id)) {
		gr.setValue("sys_mod_count", parseInt(gr.getValue("sys_mod_count")) + 1);
		gr.update();
	}
}
