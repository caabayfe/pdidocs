(function refineQuery(current, parent) {
	var appID = parent.getUniqueValue();
	var files = new GlideRecord('sys_metadata');
	files.addQuery('sys_scope', appID);
	files.addQuery('sys_customer_update', true);
	files.query();
	
	var customerFileIds = new global.UpdateVersionAPI().getCustomerFileIds(files);
	if(customerFileIds.length > 0)
		current.addQuery('sys_id', 'NOT IN', customerFileIds);
	
	current.addQuery('sys_scope', appID);
})(current, parent);
