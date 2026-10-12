function findDuplicates(scripted, id) {
	var result = [];
	
	//get the duplicate scripted and non-scripted indicators
	var indicator = new GlideAggregate('pa_indicators');
	if (id)
		indicator.addEncodedQuery('sys_idIN' + id, true);
	indicator.addQuery('type', 1);
	indicator.addQuery('scripted', scripted);
	indicator.groupBy('cube');
	indicator.groupBy('conditions');
	indicator.groupBy('aggregate');
	if (scripted) {
		indicator.groupBy('script');
	} else {
		indicator.groupBy('field');
	}
	indicator.addAggregate('COUNT');
	indicator.query();
	
	while (indicator.next()) {
		if (indicator.getAggregate('COUNT') > 1) {
			var dupIndicator = new GlideRecord('pa_indicators');
			dupIndicator.addQuery('type', 1);
			dupIndicator.addQuery('scripted', scripted);
			dupIndicator.addQuery('cube', indicator.cube);
			dupIndicator.addQuery('conditions', indicator.conditions);
			dupIndicator.addQuery('aggregate', indicator.aggregate);
			if (scripted) {
				dupIndicator.addQuery('script', indicator.script);
			} else {
				dupIndicator.addQuery('field', indicator.field);				
			}
			dupIndicator.query();
			
			while (dupIndicator.next()) {
				result.push(dupIndicator.getValue('sys_id'));
			}
		}
	}
	return result;
}

function executeDiagnostic(id) {
	var result = [];
	var arrUtil = new global.ArrayUtil();
	
	//get the duplicate scripted indicators
	arrUtil.concat(result, findDuplicates(true, id));
	
	//get the duplicate non-scripted indicators
	arrUtil.concat(result, findDuplicates(false, id));
	
	return result;
}

executeDiagnostic(id);
