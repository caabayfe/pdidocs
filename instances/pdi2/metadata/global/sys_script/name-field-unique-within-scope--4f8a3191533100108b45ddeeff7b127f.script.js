(function executeRule(current, previous) {
	if (current.operation() == "insert")
		new PDNameGenerator().generateNameFromLabel(["sys_scope"]);
	else if (current.name.changes()) {
		var gr = new GlideRecord("sys_pd_process_definition");
		gr.addQuery("sys_scope", current.sys_scope);
		gr.addQuery("sys_id", "!=", current.sys_id);
		gr.addQuery("name", current.name);
		gr.query();

		//Checks if there's another record with same name
		if (gr.next()) {
			gs.addErrorMessage(
				gs.getMessage('A process definition with the name "{0}" already exists.', current.name));
			current.setAbortAction(true);
		}
	}
})(current, previous);
