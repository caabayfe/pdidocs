(function executeRule(current, previous /*null when async*/) {
	// find any related application instances in the old table and update them to the new table...
	var old_table = '' + previous.table;
	var new_table = '' + current.table;
	var gr = new GlideRecord(old_table);
	gr.addQuery('classifier', current.getUniqueValue());
	gr.query();
	while (gr.next()) {
		gr.sys_class_name = new_table;
		gr.update();
	}
})(current, previous);
