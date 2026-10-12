function onLoad() {
	var sourceValue = g_form.getValue('sla_timer_source');
	var parsedSourceValue = parseInt(sourceValue);

	_filterDisplay();

	if (parsedSourceValue === 0) {
		_controlDisplay(false, false);
		_filterDisplay(false);
	}

	if (parsedSourceValue === 1) {
		_controlDisplay(true, false);
		_filterDisplay(true);
	}

	if (parsedSourceValue === 2) {
		_controlDisplay(true, true);
		_filterDisplay(false);
	}
}

function _filterDisplay(showCondition) {
	g_form.setSectionDisplay('condition', showCondition);
}

function _controlDisplay(showCompletedCancelled, showConfigMapping) {
	g_form.setVisible('show_complete', showCompletedCancelled);
	g_form.setVisible('show_cancelled', showCompletedCancelled);

	if (showConfigMapping)
		g_form.showRelatedList('sla_timer_config_mapping');
	else
		g_form.hideRelatedList('sla_timer_config_mapping');
}
