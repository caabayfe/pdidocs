(function refineQuery(current, parent) {
	current.addQuery('upgrade_history', parent.getUniqueValue());
	current.addEncodedQuery('dispositionIN4,104,9,10^changed=true^ORdisposition=9^resolution_status=not_reviewed^ORresolution_status=');
})(current, parent);
