validateBreakdownLevel2();

function validateBreakdownLevel2() {
	if (!current.breakdown || current.breakdown == '') {
		current.breakdown = current.breakdown_level2;
		current.element = current.element_level2;
		current.breakdown_level2 = '';
		current.element_level2 = '';
	}
	if (current.breakdown && current.breakdown != '' && (!current.element || current.element == ''))
		current.element = 'unmatched';
	if (!current.indicator.collect_breakdown_matrix && current.indicator.type != 2) {
		current.breakdown_level2 = '';
		current.element_level2 = '';
		return;
	}
	if (current.breakdown_level2 && current.breakdown_level2 != '' && (!current.element_level2 || current.element_level2 == ''))
		current.element_level2 = 'unmatched';
}
