(function executeRule(current, previous /*null when async*/) {

	if (!current.condition.activity.workflow_version)
		return;

	var gr = new GlideRecord("wf_workflow_version");

	if (gr.get(current.condition.activity.workflow_version)) {
		gr.setValue("sys_mod_count", parseInt(gr.getValue("sys_mod_count")) + 1);
		gr.update();
	}

})(current, previous);
