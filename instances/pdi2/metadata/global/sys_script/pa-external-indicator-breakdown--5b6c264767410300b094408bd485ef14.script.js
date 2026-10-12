(function executeRule(current, previous /*null when async*/) {
	g_scratchpad.sql_statement = current.sql_statement;
	g_scratchpad.indicator_id = current.indicator.id;
	g_scratchpad.indicator_sys_id = current.indicator;
	g_scratchpad.breakdown_id = current.breakdown.id;
	g_scratchpad.breakdown_sys_id = current.breakdown;
	g_scratchpad.new_table = gs.getProperty('com.snc.pa.new_scores_tables', true);
})(current, previous);
