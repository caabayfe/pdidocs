(function refineQuery(current, parent) {

	var batchId = parent.getUniqueValue();
	current.addQuery('batch_install_plan', batchId);
	current.orderBy('type');
	current.orderByDesc('sys_created_on');
	
})(current, parent);
