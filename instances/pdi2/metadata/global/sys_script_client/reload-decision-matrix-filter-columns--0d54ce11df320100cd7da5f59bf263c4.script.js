function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue == '' || g_scratchpad._lockDisplayField) {
        if (isLoading) {
			var isReference = g_scratchpad._loadDisplayIsReference;
			if (isReference != 'true' && isReference != true)
				setDisplayAllVisibility(false);
			delete g_scratchpad._loadDisplayIsReference;
		}
		return;
    }
	
	var currentGroup = newValue;
	var currentTable = g_form.getValue('table');
	var referenceFields = g_scratchpad._groupReferenceFields;
	var filterCond = document.getElementById('asmt_metric_type.filter_condition');
	// If this is a reference field, use the table that is referenced
	if (currentGroup in referenceFields) {
		if(filterCond){
			filterCond.setAttribute('data-restricted_fields', '');
		}
		g_form.setValue('filter_table',  referenceFields[currentGroup]);
		setDisplayAllVisibility(true);
	}
	// Otherwise, use the current table and limit the
	// condition options to be the current group only.
	else {
		if(filterCond){
			filterCond.setAttribute('data-restricted_fields', currentGroup);
		}
		g_form.setValue('filter_table', currentTable);
		setDisplayAllVisibility(false);
	}
	if (g_form.hasField('filter_condition'))
		window.setTimeout(function(){
		    loadFilterColumns('asmt_metric_type.filter_condition', 'filter_table');
		    AssessmentClientUtils.populateDefaultFilter();
		},0);
}

function setDisplayAllVisibility(visible) {
	var displayAllField = $('asmt_metric_type.display_all_filters');
	if (displayAllField)
		g_form.setDisplay('display_all_filters', visible);
}
