(function refineQuery(current, parent) {
	current.addQuery('parent', current.detail);
	current.addNotNullQuery('parent');
})(current, parent);
