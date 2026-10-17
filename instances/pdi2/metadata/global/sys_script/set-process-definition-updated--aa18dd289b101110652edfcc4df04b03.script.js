(function executeRule(current, previous /*null when async*/) {

	var definition = new GlideRecord("sys_pd_process_definition");
	definition.addQuery("sys_id", current.process_definition);
	definition.query();
	while (definition.next()) {
		definition.autoSysFields(false);
		var updated = current.operation() === "delete" ? gs.nowDateTime() : current.sys_updated_on;
		definition.sys_updated_on = updated;
		definition.update();
	}

})(current, previous);
