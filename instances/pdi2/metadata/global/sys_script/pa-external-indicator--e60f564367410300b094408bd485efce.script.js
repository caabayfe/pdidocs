(function executeRule(current, previous /*null when async*/) {
	g_scratchpad.sql_statement = current.sql_statement;
	g_scratchpad.id = current.id;
	g_scratchpad.sys_id = current.sys_id;
	g_scratchpad.new_table = gs.getProperty('com.snc.pa.new_scores_tables', true);
})(current, previous);
