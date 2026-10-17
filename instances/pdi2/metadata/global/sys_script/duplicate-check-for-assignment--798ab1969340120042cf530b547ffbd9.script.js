(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord("sc_item_variable_assignment");
	gr.addQuery("rule", current.getValue("rule"));
	gr.addQuery("item_variable", current.getValue("item_variable"));
	gr.addQuery("sys_id", "!=", current.getUniqueValue());
	gr.query();
	if(gr.next()){
		var error = gs.getMessage("Duplicate assignments for the same item variable are not allowed.");
		current.setAbortAction(true);
		current.item_variable.setError(error);
	}
})(current, previous);
