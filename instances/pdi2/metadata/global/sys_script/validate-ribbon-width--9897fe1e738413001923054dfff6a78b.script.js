(function executeRule(current, previous /*null when async*/) {
	var ribbon = new GlideRecord(current.getTableName());
	ribbon.addQuery('table', current.table);
	ribbon.addQuery('sys_id','!=', current.getUniqueValue());
	ribbon.addQuery('sys_id','!=', current.sys_overrides+'');
	ribbon.addQuery('workspace', current.workspace);
	ribbon.query();
	var sum = parseInt(current.width);
	while(ribbon.next()) {
		if (ribbon.active)
			sum += parseInt(ribbon.width);
	}

	if (sum > 12) {
		var refreshPageMessage = '';
		gs.addInfoMessage(gs.getMessage("The combined width of the ribbon widgets should equal 12 or less for the {0} table. {1}", [current.table, refreshPageMessage]));
	}	
})(current, previous);
