(function executeRule(current, previous /*null when async*/) {

	if (gs.nil(current.decision_table)) {
		return;
	}
	
	var gr = new GlideRecord("sys_decision_question");
	gr.addQuery("decision_table", current.decision_table);
	gr.addQuery("sys_id", "!=", current.sys_id);
	gr.query();
	
	while (gr.next()) {
		gr.setValue("default_answer", false);
		gr.update();
	}
	

})(current, previous);
