function onSubmit() {
	var sqlStatement = g_form.getValue('sql_statement');
	if (g_scratchpad.sql_statement && g_scratchpad.sql_statement != sqlStatement) {
		var scores = false;
		var gr;
		if (g_scratchpad.new_table) {
			gr = new GlideRecord('pa_scores_l1');
			gr.addQuery('indicator', g_scratchpad.id);
		} else {
			gr = new GlideRecord('pa_scores');
			gr.addQuery('indicator', g_scratchpad.sys_id);
		}
		gr.setLimit(1);
		gr.query();
		if (gr.next())
			scores = true;
		
		if (scores)
			return confirm(getMessage('There are already scores collected for this indicator.\nAre you sure you want to change the SQL Statement?'));
	}
   
}
