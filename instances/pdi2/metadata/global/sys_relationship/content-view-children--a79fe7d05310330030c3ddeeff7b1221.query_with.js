(function refineQuery(current, parent) {
	current.addQuery('parent', parent.content);
	current.addNotNullQuery('parent');
})(current, parent);
