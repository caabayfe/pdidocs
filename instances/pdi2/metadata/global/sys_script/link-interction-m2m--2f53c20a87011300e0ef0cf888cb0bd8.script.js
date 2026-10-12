(function executeRule(current, previous /*null when async*/) {
	if (!previous.parent_interaction.nil()) {
		var gr = new GlideRecord('interaction_related_record');
		gr.addQuery('document_id', current.sys_id);
		gr.addQuery('document_table', current.getTableName());
		gr.query();
		if (gr.next()) {
			gr.interaction = current.parent_interaction;
			gr.update();
			return;
		}
	}
	else {
		var gr = new GlideRecord('interaction_related_record');
		gr.initialize();
		gr.document_id = current.sys_id;
		gr.operation = current.operation() == "insert" ? "Created" : "Updated";
		gr.document_table = current.getTableName();
		gr.interaction = current.parent_interaction;
		gr.insert();
	}

})(current, previous);
