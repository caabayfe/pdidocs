(function refineQuery(current, parent) {
	current.addQuery('upgrade_history', parent.getUniqueValue());
	current.addQuery('disposition', [4, 104]);
	current.addQuery('changed', false);
})(current, parent);
