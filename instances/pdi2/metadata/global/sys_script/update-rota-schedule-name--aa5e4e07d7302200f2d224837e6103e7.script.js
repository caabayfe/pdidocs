(function executeRule(current, previous /*null when async*/) {
	// Update Schedule name (only if it matches previous name)
	var gr = new GlideRecord("cmn_schedule");
	gr.get(current.schedule);
	if (gr.name == previous.name) {
		gr.name = current.name;
		gr.update();
	}
	
	// Update Schedule entry names (only if it matches previous name)
	gr = new GlideRecord("cmn_schedule_span");
	gr.query("schedule", current.schedule);
	gr.query("name", previous.name);
	gr.query("schedule.type", "roster");
	gr.query("schedule.document_key", current.sys_id);
	while (gr.next()) {
		gr.setValue("name", current.name);
		gr.update();
	}
})(current, previous);
