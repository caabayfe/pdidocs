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
	if (!current.indicator.collect_breakdown_matrix) {
		current.breakdown_level2 = '';
		current.element_level2 = '';
		return;
	}
	if (current.breakdown_level2 && current.breakdown_level2 != '' && (!current.element_level2 || current.element_level2 == ''))
		current.element_level2 = 'unmatched';
	if (current.breakdown && current.breakdown_level2 && current.breakdown != '' && current.breakdown_level2 != '' && current.breakdown > current.breakdown_level2) {
		var cur_breakdown = ''+current.breakdown,
	        cur_element = ''+current.element,
			cur_breakdown_level2 = ''+current.breakdown_level2,
			cur_element_level2 = ''+current.element_level2;
		current.breakdown = cur_breakdown_level2;
		current.element = cur_element_level2;
		current.breakdown_level2 = cur_breakdown;
		current.element_level2 = cur_element;
	}
}
