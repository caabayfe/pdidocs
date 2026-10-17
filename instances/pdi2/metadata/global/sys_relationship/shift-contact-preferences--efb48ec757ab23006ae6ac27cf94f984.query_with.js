(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
	current.addQuery('cmn_rota', parent.getUniqueValue());
	current.addQuery('type', 'rota');

})(current, parent);
