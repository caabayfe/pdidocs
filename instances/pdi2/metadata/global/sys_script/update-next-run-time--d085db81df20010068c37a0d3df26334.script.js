updateNextRunTime();

function updateNextRunTime() {
	var gr = new GlideRecord("cert_audit");
	if(gr.get(current.sys_id)) {
		if (gr.run_type != "on_demand")
			gr.next_scheduled_run = (new CertificationUtils()).getTriggerNextRunTime(false, "cert_audit", gr.sys_id);
		else
			gr.next_scheduled_run = "";
		gr.setWorkflow(false);
		gr.update();
	}
}
