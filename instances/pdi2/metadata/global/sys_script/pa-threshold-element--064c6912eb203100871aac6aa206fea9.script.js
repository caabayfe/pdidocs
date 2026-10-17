function onBefore(current, previous) {
	if (!current.breakdown || current.breakdown == '') {
		current.breakdown = '';
		current.element = '';
		current.breakdown_level2 = '';
		current.element_level2 = '';
		return;
	}
	
	if (!current.element || current.element == '') {
		current.element = 'unmatched';
	}
	
	var breakdownChanged = (current.breakdown != previous.breakdown);
	var elementChanged = (current.element != previous.element);
	if (breakdownChanged && !elementChanged) {
		current.element = 'unmatched';
	}
	
	if (!current.breakdown_level2 || current.breakdown_level2 == '') {
		current.element_level2 = '';
		return;
	}
	
	if (!current.element_level2 || current.element_level2 == '') {
		current.element_level2 = 'unmatched';
	}
	
	var breakdownL2Changed = (current.breakdown_level2 != previous.breakdown_level2);
	var elementL2Changed = (current.element_level2 != previous.element_level2);
	if (breakdownL2Changed && !elementL2Changed) {
		current.element_level2 = 'unmatched';
	}
}
