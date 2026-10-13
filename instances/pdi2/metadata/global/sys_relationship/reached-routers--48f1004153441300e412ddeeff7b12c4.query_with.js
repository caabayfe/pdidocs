(function refineQuery(current, parent) {

	current.addQuery('status', parent.subnet_discovery_status +'');
	current.addQuery('result', 'success');

})(current, parent);
