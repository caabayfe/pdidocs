(function refineQuery(current, parent) {

	current.addQuery('status', 'IN', parent.range_assign_status);
	current.addQuery('result', 'success');

})(current, parent);
