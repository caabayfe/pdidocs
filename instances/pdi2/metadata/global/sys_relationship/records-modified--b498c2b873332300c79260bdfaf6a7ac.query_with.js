(function refineQuery(current, parent) {

	current.addQuery('test', parent.test);
	current.addQuery('parameter_set_order', parent.order);

})(current, parent);
