(function executeRule(current, previous /*null when async*/) {
	var isValid = true;
	
	// generate list of fields for specific content block
	var type = current.type.getDisplayValue();
	var tableFields = ['table', 'metric_aggregation_function', 'metric_aggregate_field', 'filter_query'];
	var indicatorFields = ['indicator', 'metric_time_aggregation'];
	
	if (type === 'Analytics - Single Score')
		indicatorFields.push('show_change', 'show_change_percentage', 'show_gap_percentage', 'show_sparkline', 'sparkline_style', 'show_score_date', 'show_target');
	else if (type === 'Analytics - Donut' || type === 'Analytics - Horizontal Bar' || type === 'Analytics - Vertical Bar' || type === 'Analytics - Pie' || type === 'Analytics - Semi Donut')
		tableFields.push('groupby_field', 'show_others');
	else if (type === 'Analytics - Column' || type === 'Analytics - Area' || type === 'Analytics - Line' || type === 'Analytics - Scatter' || type === 'Analytics - Spline' || type === 'Analytics - Step')
		tableFields.push('groupby_field', 'trendby_date_field', 'trendby_aggregation_period');
	
	// ensure that restricted fields are empty
	var source = current.variable.data_source.getDisplayValue();
	if (source === 'Table') {
		for (var i = 0; i <= indicatorFields.length; i++) {
			if (current.variable[indicatorFields[i]]) {
				isValid = false;
				gs.addErrorMessage(gs.getMessage('{0} is only available for indicator data sources.', current.variable[indicatorFields[i]].getLabel()));
			}
		}

		if (current.variable.metric_aggregation_function.getDisplayValue() === 'Count' && current.variable.metric_aggregate_field) {
			isValid = false;
			gs.addErrorMessage(gs.getMessage('Cannot do COUNT aggregation on an aggregate field.'));
		}
	} else if (source === 'Indicator') {
		for (var j = 0; j <= tableFields.length; j++) {
			if (current.variable[tableFields[j]]) {
				isValid = false;
				gs.addErrorMessage(gs.getMessage('{0} is only available for table data sources.', current.variable[tableFields[j]].getLabel()));
			}
		}
		
		if (current.variable.show_change_percentage && !current.variable.show_change) {
			isValid = false;
			gs.addErrorMessage(gs.getMessage('Show Change % is only available if Show change is true.'));
		}
		
		if (current.variable.show_gap_percentage && !current.variable.show_target) {
			isValid = false;
			gs.addErrorMessage(gs.getMessage('Show Gap % is only available if Show target is true.'));
		}
		
		if (!current.variable.sparkline_style != !current.variable.show_sparkline) {
			isValid = false;
			gs.addErrorMessage(gs.getMessage('Show sparkline needs to be set with Sparkline style.'));
		}
	}
	
	if (!isValid) {
		current.setAbortAction(true);
		
		return false;
	}
	
	return true;

})(current, previous);
