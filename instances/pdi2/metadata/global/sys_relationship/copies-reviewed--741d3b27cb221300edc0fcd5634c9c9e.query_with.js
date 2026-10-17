(function refineQuery(current, parent) {
	
	current.addQuery('upgrade_history', parent.getUniqueValue());
	current.addEncodedQuery('dispositionIN201,202,203^resolution_status!=not_reviewed^resolution_status!=');
})(current, parent);
