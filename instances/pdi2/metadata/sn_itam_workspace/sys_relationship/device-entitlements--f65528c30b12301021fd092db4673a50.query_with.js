(function refineQuery(current, parent) {
	current.addQuery('licensed_by',parent.getUniqueValue());
})(current, parent);
