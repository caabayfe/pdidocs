(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
	current.addQuery('transaction_id', parent.transaction_id);
	current.addQuery('sys_created_on', '>=', parent.sys_created_on);
	current.addQuery('sys_created_on', '<=', parent.load_completed);
	current.addNotNullQuery('transaction_id');

})(current, parent);
