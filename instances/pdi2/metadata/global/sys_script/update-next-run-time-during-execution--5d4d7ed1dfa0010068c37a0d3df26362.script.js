updateNextRunTimeDuringExecution();

function updateNextRunTimeDuringExecution() {
	var gr = new GlideRecord("cert_audit");
	gr.get(current.sys_id);
	if (gr.run_type != "on_demand")
		gr.next_scheduled_run = (new CertificationUtils()).getTriggerNextRunTime(true, "cert_audit", gr.sys_id);
	else
		gr.next_scheduled_run = "";
	current.inUpdateRule = true;
	gr.setWorkflow(false);
	gr.update();
}
