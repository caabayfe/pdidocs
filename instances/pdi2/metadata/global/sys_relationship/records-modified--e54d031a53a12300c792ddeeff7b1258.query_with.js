(function refineQuery(current, parent) {

	current.addQuery('test', parent.getUniqueValue());
	// if this is a parameterized test, order by the parameter set
	if (parent.enable_parameterized_testing)
		current.orderBy('parameter_set_order');

})(current, parent);
