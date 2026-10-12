(function refineQuery(current, parent) {
	current.addQuery('upgrade_history', parent.getUniqueValue());
})(current, parent);
