(function refineQuery(current, parent) {
	current.addQuery('upgrade_history', parent.getUniqueValue());
	current.addEncodedQuery('dispositionIN1,2,3,101,102,103^changed=true');
})(current, parent);
