(function executeRule(current, previous /*null when async*/) {
	var order = 1000;
	var roleOrder = new GlideRecord('sys_embedded_help_role');
	roleOrder.addQuery('role', current.getValue('role'));
	roleOrder.query();
	
	if (roleOrder.next())
		order = roleOrder.order;
	
	current.setValue('role_order', order);
})(current, previous);
