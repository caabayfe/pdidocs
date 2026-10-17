(function executeRule(current, previous /*null when async*/) {
	if (current.table)
		current.sys_name = current.table;
	else if (current.index_group)
		current.sys_name = current.index_group.name;
})(current, previous);
