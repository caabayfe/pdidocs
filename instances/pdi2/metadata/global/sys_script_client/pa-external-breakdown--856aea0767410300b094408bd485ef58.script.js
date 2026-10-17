function onSubmit() {
	var sqlStatement = g_form.getValue('sql_statement');
	if (g_scratchpad.sql_statement && g_scratchpad.sql_statement != sqlStatement) {
		var links = false;
		var gr = new GlideRecord('pa_indicator_breakdowns');
		gr.addQuery('breakdown', g_scratchpad.sys_id);
		gr.setLimit(1);
		gr.query();
		if (gr.next())
			links = true;
		
		if (links)
			return confirm(getMessage('There are already indicators linked with this breakdown.\nAre you sure you want to change the SQL Statement?'));
	}
   
}
