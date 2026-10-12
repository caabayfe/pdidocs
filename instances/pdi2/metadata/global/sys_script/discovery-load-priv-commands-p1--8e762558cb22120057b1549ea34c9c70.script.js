(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord("ecc_agent");
	gr.query();
	while(gr.next()){
		if (gr.sys_id != current.mid)
			continue;
		var probe = new SncProbe();
		probe.topic = "SystemCommand";
		probe.source = "privileged_command_reload";
		probe.setEccPriority("0");
		probe.addParameter("skip_sensor", "true");
		probe.create("mid.server." + gr.name);
	}

})(current, previous);
