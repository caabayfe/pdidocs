(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	if (current.applies_to == 'item')
		current.setValue('variable_set', '');
	else if (current.applies_to == 'set')
		current.setValue('catalog_item', '');

})(current, previous);
