(function executeRule(current, previous /*null when async*/) {
	var operation = new GlideRecord("sys_ws_operation");
	operation.addQuery("name", "Trigger:" + current.sys_id);
	operation.query();
	if (operation.next())
		operation.deleteRecord();
	// Add your code here

})(current, previous);
