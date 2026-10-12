(function refineQuery(current, parent) {
	current.addQuery('upgrade_history', parent.getUniqueValue());
	current.addEncodedQuery('dispositionIN4,5,104,105,9,10^changed=true^ORdispositionIN9,5,105^resolution_status!=not_reviewed^resolution_status!=');
})(current, parent);
