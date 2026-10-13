(function executeRule(current, previous/*null when async*/) {

	var CMDB_CI_TYPE = 'cmdb_ci_type';
	var SOURCE_METRICS_TYPES = 'source_metrics_types';
	var DEFAULT_NUM_OF_CHARTS_PER_WIDGET = 10;
	var SOURCE = 'source';
	// Enforces unique records for a given CI and source metrics types combination
	if (!current) 
		return;

	var uniqueFields = [CMDB_CI_TYPE, SOURCE, SOURCE_METRICS_TYPES];

	// Ignore check if none of these fields have been modified, for non-unique fields
	var someChanged = false;
	uniqueFields.forEach(function (field) {
		if (current[field].changes()) 
			someChanged = true;
		}
	);
	if (!someChanged) 
		return;
	
	var existingGr = new GlideRecord('sa_metric_dashboard_metadata');
	existingGr.addQuery('sys_id', '!=', current['sys_id']);
	uniqueFields.forEach(function (field) {
		existingGr.addQuery(field, '=', current[field]);
	});
	existingGr.query();

	if (existingGr.hasNext()) {
		var labels = uniqueFields.map(function (field) {
			return current[field].getLabel();
		}).join(', ');
		var msg2 = gs.getMessage('A record already exists for this combination of {0}', labels);
		gs.addErrorMessage(msg2);
		current.setAbortAction(true);
		return;
	}

	// Verify validation on number of source metrics types been inserted
	var numOfmetricTypes = current[SOURCE_METRICS_TYPES].split(',').length;
	var numOfChartsPerWidgetLimit = gs.getProperty('ws_metric.datasets_per_widget_limit', DEFAULT_NUM_OF_CHARTS_PER_WIDGET);
	if(numOfmetricTypes > numOfChartsPerWidgetLimit) {
		var msg3 = gs.getMessage('You had exceeded the number of source metrics types you can define due to limitation in ws_metric.datasets_per_widget_limit sys properties which its:  {0}', numOfChartsPerWidgetLimit);
		gs.addErrorMessage(msg3);
		current.setAbortAction(true);
	}
	
})(current, previous);
