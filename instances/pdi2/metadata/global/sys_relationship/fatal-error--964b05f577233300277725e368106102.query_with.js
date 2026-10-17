(function refineQuery(current, parent) {
	current.addQuery('upgrade_history', parent.getUniqueValue());
	current.addQuery('disposition', '301');
})(current, parent);
