(function executeRule(current, previous /*null when async*/) {
    var gr = new GlideRecord('em_suggested_relation_type');
    gr.addQuery("relationship", current.relationship);
    gr.addQuery("base_class", current.base_class);
    gr.addQuery("dependent_class", current.dependent_class);
	gr.addQuery("sys_id", "!=", current.sys_id);
    gr.setLimit(1);
    gr.query();
	if (gr.next()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("A record with these values already exists"));
	}
})(current, previous);
