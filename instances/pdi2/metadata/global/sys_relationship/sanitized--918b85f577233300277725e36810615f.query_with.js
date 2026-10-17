(function refineQuery(current, parent) {
	current.addQuery('upgrade_history', parent.getUniqueValue());
	current.addQuery('disposition', '303');
})(current, parent);
