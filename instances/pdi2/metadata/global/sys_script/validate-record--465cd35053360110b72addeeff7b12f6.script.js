(function executeRule(current, previous /*null when async*/) {
	var scope = current.sys_scope;
	if (scope != "global") {
		gs.addErrorMessage(gs.getMessage("The record can only be created in global scope"));
		current.setAbortAction(true);
		return;
	}
	
	var ga = new GlideAggregate(current.getTableName());
	ga.addQuery("sys_id", "!=", current.getUniqueValue());
	ga.addQuery("name", current.name);
	var count = ga.getCount();
	if (count > 0) {
		gs.addErrorMessage(gs.getMessage("The record with name '{0}' already exists", [current.name]));
		current.setAbortAction(true);
		return;
	}

})(current, previous);
