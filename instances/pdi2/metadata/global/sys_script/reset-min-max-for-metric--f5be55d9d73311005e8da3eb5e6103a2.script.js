updateMinAndMax();

function updateMinAndMax() {
	// Get the parent table's min and max so they can be reset if needed
	var metricRec = new GlideRecord('asmt_metric');
	metricRec.addQuery('sys_id', current.metric);
	metricRec.query();
	
	// Generally, keep the metric's min/max driven off of existing values
	// in metric defs.  Numeric Scale, the metric defs are driven in the 
	// opposite direction, where the metric's min and max determines how many 
	// metric defs are created.
	if (metricRec.next() && metricRec.datatype != 'numericscale') {
		var min = metricRec.min;
		var max = metricRec.max;
		
		if (current.operation() == 'delete' || current.operation() == 'insert'
			|| minMaxMustChange(min, max, metricRec.datatype)) {
			var minMax = getDefinitionMinAndMax(metricRec.datatype);
			metricRec.min = minMax[0];
			metricRec.max = minMax[1];
			
			metricRec.update();
			
			if ((current.operation() != 'delete') && (current.operation() != 'insert'))
				showReloadMessage();
		}
	}
}

function minMaxMustChange(min, max, datatype) {
	if (datatype == 'multiplecheckbox')
		return current.normalization_input.changes();
	
	var startingValue = previous.value;
	var currentValue = current.value;
	
	if ((Math.round(startingValue - min) == 0) && (Math.abs(Math.round(currentValue - min)) >= 1))
		return true;
	
	if ((Math.round(startingValue - max) == 0) && (Math.abs(Math.round(currentValue - max)) >= 1))
		return true;
	
	if (((currentValue < min) && (Math.abs(Math.round(currentValue - min)) >= 1)) 
		|| ((currentValue > max) && (Math.abs(Math.round(currentValue - max)) >= 1)))
		return true;		
	
	return false;
}

function getDefinitionMinAndMax(datatype) {
	var minMax = [0, 0];
	var definitionRec = new GlideAggregate('asmt_metric_definition');
	definitionRec.addQuery('metric', current.metric);
	
	if (datatype == 'multiplecheckbox') {
		definitionRec.addQuery('normalization_input', '>', '0');
		
		if ((!gs.nil(current.metric)) && current.metric.maximum_normalization_input == true)
			definitionRec.addAggregate('MAX', 'normalization_input');
		else
			definitionRec.addAggregate('SUM', 'normalization_input');
		
		definitionRec.groupBy('metric');
		definitionRec.query();
		if (definitionRec.next()) {
			
			if ((!gs.nil(current.metric)) && current.metric.maximum_normalization_input == true)
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
			if ((!gs.nil(current.metric)) && current.metric.maximum_normalization_input == true)
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
