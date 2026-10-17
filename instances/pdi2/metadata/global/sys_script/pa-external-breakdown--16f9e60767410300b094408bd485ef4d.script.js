(function executeRule(current, previous /*null when async*/) {
	g_scratchpad.sql_statement = current.sql_statement;
	g_scratchpad.sys_id = current.sys_id;
})(current, previous);
