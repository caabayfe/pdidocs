(function executeRule(current, previous /*null when async*/) {
	var ribbon = new GlideRecord(current.getTableName());
	ribbon.addActiveQuery();
	ribbon.addQuery('table', current.table);
	ribbon.addQuery('configuration', current.configuration);
	ribbon.addQuery('sys_id','!=', current.getUniqueValue());
	ribbon.addQuery('ribbon.sys_domain', current.ribbon.sys_domain);
	ribbon.query();
	var sum = parseInt(current.width);
	while (ribbon.next() && sum <= 12) {
		sum += parseInt(ribbon.width);
	}

	if (sum > 12) {
		gs.addErrorMessage(gs.getMessage("The combined width of the ribbon widgets must equal 12 or less for the {0} table and Ribbon Configuration", [current.table]));
		current.setAbortAction(true);
	}	
})(current, previous);
