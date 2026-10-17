function onLoad() {
	
	// checking support of setLabel api for workspace
	var changeLabel = g_form.setLabel;
	if (!changeLabel) 
		changeLabel = g_form.setLabelOf.bind(g_form);
	else
		changeLabel = g_form.setLabel.bind(g_form);
	
	if (g_form.getValue('resolution_code') === '') {
		if (g_form.hasField('closed_at')) 
			changeLabel('closed_at', getMessage("CLOSED_DATE"));
		if (g_form.hasField('closed_by'))
			changeLabel('closed_by', getMessage("Closed by"));
		if (g_form.hasField('close_notes'))
			changeLabel('close_notes', getMessage("Close notes"));
	}

	if (g_form.getValue('resolution_code') === 'canceled') {
		if (g_form.hasField('closed_at'))
			changeLabel('closed_at', getMessage("CANCELED_DATE"));				
		if (g_form.hasField('closed_by'))
			changeLabel('closed_by', getMessage("Canceled by"));
		if (g_form.hasField('close_notes'))
			changeLabel('close_notes', getMessage("Canceled reason"));
	}
		
	if (g_form.getValue('resolution_code') === 'duplicate') {
		if (g_form.hasField('closed_at'))
			changeLabel('closed_at', getMessage("MARKED_DUPLICATE_DATE"));
		if (g_form.hasField('closed_by'))
			changeLabel('closed_by', getMessage("Marked duplicate by"));
	}
	
	if ((g_form.getValue('resolution_code') === 'fix_applied') && (g_form.getValue('state') === g_scratchpad.STATE.CLOSED)) {
		if (g_form.hasField('closed_at'))
			changeLabel('closed_at', getMessage("COMPLETED_DATE"));
		if (g_form.hasField('closed_by'))
			changeLabel('closed_by', getMessage("Completed by"));
	}
	
	if (g_form.getValue('resolution_code') === 'risk_accepted'){
		if (g_form.hasField('closed_at'))
			changeLabel('closed_at', getMessage("RISK_ACCEPTED_DATE"));
		if (g_form.hasField('closed_by'))
			changeLabel('closed_by', getMessage("Risk accepted by"));
		if (g_form.hasField('close_notes'))
			changeLabel('close_notes',getMessage("Risk accepted reason"));
	}
		
}
