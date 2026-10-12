(function executeRule(current, previous /*null when async*/) {

	if (current.sp_widget.data_table == current.sys_class_name)
		return;
	
	current.sys_class_name = current.sp_widget.data_table;

})(current, previous);
