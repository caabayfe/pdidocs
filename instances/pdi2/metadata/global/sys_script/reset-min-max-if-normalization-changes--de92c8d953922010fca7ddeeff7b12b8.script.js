updateMinAndMax();

function updateMinAndMax() {
	var minMax = getDefinitionMinAndMax(current.datatype);
	
	current.min = minMax[0];
	current.max = minMax[1];

	current.update();
	
	showReloadMessage();
}

function getDefinitionMinAndMax(datatype) {
	var minMax = [0, 0];
	var definitionRec = new GlideAggregate('asmt_metric_definition');
	definitionRec.addQuery('metric', current.getUniqueValue());
	
	if (datatype == 'multiplecheckbox') {
		definitionRec.addQuery('normalization_input', '>', '0');

		if (current.maximum_normalization_input == true)
			definitionRec.addAggregate('MAX', 'normalization_input');
		else
			definitionRec.addAggregate('SUM', 'normalization_input');

		definitionRec.groupBy('metric');
		definitionRec.query();
		if (definitionRec.next()) {
			if (current.maximum_normalization_input == true)
				minMax[1] = definitionRec.getAggregate('MAX', 'normalization_input');
			else
				minMax[1] = definitionRec.getAggregate('SUM', 'normalization_input');
		}		
	} else {
		definitionRec.addQuery('value', '!=', '-1');
		definitionRec.addAggregate('MIN', 'value');
		definitionRec.addAggregate('MAX', 'value');
		definitionRec.groupBy('metric');
		definitionRec.query();
		if (definitionRec.next()) {
			if (current.maximum_normalization_input == true)
				minMax[0] = 0;
			else
				minMax[0] = definitionRec.getAggregate('MIN', 'value');
			minMax[1] = definitionRec.getAggregate('MAX', 'value');
		}
	}
	
	return minMax;
}

function showReloadMessage() {
	var transaction = GlideTransaction.get();
	if(transaction){
		var uri = gs.action.getGlideURI();
		var referredFromUrl = uri.get('x_referer');
		if (referredFromUrl != null) {
			var endOfName = referredFromUrl.indexOf("?");
			if (endOfName >= 0) {
				var srcForm = referredFromUrl.substr(0, endOfName);
				if (srcForm == 'asmt_metric.do') {
					gs.flushMessages();// prevent stacked messages on cascading deletes
					var infoMsg = gs.getMessage("Reload the page to see the updated Min and Max values");
					gs.addInfoMessage(infoMsg);
				}
			}
		}
	}
}
