(function executeRule(current, previous /*null when async*/) {
	
	var gr = new GlideRecord('sys_ux_my_list');
	gr.addEncodedQuery('sys_created_by=javascript:gs.getUserName()^active=true^ORDERBYDESCorder');
	gr.query();
	
	if (gr.next()) {
		current.order = parseInt(gr.getValue('order'), 10) + 10;
	} 
	else {
		current.order = 10;
	}

})(current, previous);
