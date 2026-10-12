(function executeRule(current, previous /*null when async*/) {
	var child = new GlideRecord("sys_update_set");
	child.addQuery("base_update_set", current.sys_id);
	child.addQuery("sys_id", "!=", current.sys_id);
	child.addQuery("state", "in progress");
	child.setValue("state", "complete");
	child.updateMultiple();
})(current, previous);
