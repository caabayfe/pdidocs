(function executeRule(current, previous) {
	if (current.operation() == "insert" || !current.getValue("name"))
		new PDNameGenerator().generateNameFromLabel(["process_definition"]);
	else if (current.name.changes()) {
		var gr = new GlideRecord("sys_pd_lane");
		gr.addQuery("name", current.name);
		gr.addQuery("process_definition", current.process_definition);
		gr.addQuery("sys_id", "!=", current.sys_id);
		gr.query();

		//Aborts update if the name is already in use
		if (gr.hasNext()) {
			gs.addErrorMessage(
				gs.getMessage('A lane with the name "{0}" already exists.', current.name));
			current.setAbortAction(true);
		}
	}
 })(current, previous);
